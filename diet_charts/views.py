from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import DietChart
from .serializers import (
    DietChartSerializer,
    DietChartCreateSerializer,
    DietChartUpdateSerializer,
    DietChartSummarySerializer
)
from .filters import DietChartFilter


class DietChartListCreateView(generics.ListCreateAPIView):
    """List and create diet charts."""
    queryset = DietChart.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DietChartFilter
    search_fields = ['chart_name', 'patient__user_name', 'notes']
    ordering_fields = ['created_at', 'start_date', 'chart_name', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DietChartCreateSerializer
        return DietChartSerializer
    
    def perform_create(self, serializer):
        # Set the created_by to the current user
        serializer.save(created_by=self.request.user)


class DietChartDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a diet chart."""
    queryset = DietChart.objects.all()
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DietChartUpdateSerializer
        return DietChartSerializer


class DietChartSummaryListView(generics.ListAPIView):
    """List diet chart summaries (lightweight)."""
    queryset = DietChart.objects.all()
    serializer_class = DietChartSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DietChartFilter
    search_fields = ['chart_name', 'patient__user_name']
    ordering_fields = ['created_at', 'start_date', 'chart_name', 'status']
    ordering = ['-created_at']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_diet_charts(request, patient_id):
    """Get all diet charts for a specific patient."""
    try:
        charts = DietChart.objects.filter(patient_id=patient_id).order_by('-created_at')
        serializer = DietChartSummarySerializer(charts, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch diet charts: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_diet_chart(request):
    """Generate a new diet chart using AI."""
    try:
        # Extract data from request
        patient_id = request.data.get('patient_id')
        chart_name = request.data.get('chart_name', 'Generated Diet Chart')
        chart_type = request.data.get('chart_type', '7_day')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not patient_id:
            return Response(
                {'error': 'Patient ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get patient data
        from authentication.models import UnifiedPatient
        patient = get_object_or_404(UnifiedPatient, id=patient_id)
        
        # Get patient's analysis data
        prakriti_analysis = None
        disease_analysis = None
        
        # Try to get latest prakriti analysis
        try:
            from patients.models import PrakritiAnalysis
            latest_prakriti = PrakritiAnalysis.objects.filter(patient=patient).order_by('-created_at').first()
            if latest_prakriti:
                prakriti_analysis = {
                    'vata_score': latest_prakriti.vata_score,
                    'pitta_score': latest_prakriti.pitta_score,
                    'kapha_score': latest_prakriti.kapha_score,
                    'dominant_dosha': latest_prakriti.dominant_dosha,
                    'constitution_type': latest_prakriti.constitution_type,
                    'analysis_date': latest_prakriti.created_at.isoformat()
                }
        except Exception as e:
            print(f"Error fetching prakriti analysis: {e}")
        
        # Try to get latest disease analysis
        try:
            from patients.models import DiseaseAnalysis
            latest_diseases = DiseaseAnalysis.objects.filter(patient=patient).order_by('-created_at')
            if latest_diseases.exists():
                disease_analysis = []
                for disease in latest_diseases:
                    disease_analysis.append({
                        'disease_name': disease.disease_name,
                        'severity': disease.severity,
                        'symptoms': disease.symptoms,
                        'diagnosis_date': disease.created_at.isoformat()
                    })
        except Exception as e:
            print(f"Error fetching disease analysis: {e}")
        
        # Calculate target calories
        target_calories = 2000  # Default
        if patient.weight and patient.height and patient.date_of_birth:
            from datetime import date
            today = date.today()
            age = today.year - patient.date_of_birth.year
            if today.month < patient.date_of_birth.month or (today.month == patient.date_of_birth.month and today.day < patient.date_of_birth.day):
                age -= 1
            
            # BMR calculation
            if patient.gender == 'Male':
                bmr = 88.362 + (13.397 * patient.weight) + (4.799 * patient.height) - (5.677 * age)
            else:
                bmr = 447.593 + (9.247 * patient.weight) + (3.098 * patient.height) - (4.330 * age)
            
            target_calories = int(bmr * 1.375)  # Light activity multiplier
        
        # Generate meal distribution
        meal_distribution = {
            'breakfast': 0.25,
            'brunch': 0.15,
            'lunch': 0.30,
            'snack': 0.10,
            'dinner': 0.20
        }
        
        # Generate daily meals (simplified for now)
        daily_meals = generate_sample_meals(chart_type, target_calories, meal_distribution)
        
        # Create diet chart
        diet_chart_data = {
            'patient': patient_id,
            'chart_name': chart_name,
            'chart_type': chart_type,
            'status': 'draft',
            'start_date': start_date or date.today().isoformat(),
            'end_date': end_date or (date.today() + timedelta(days=6)).isoformat(),
            'total_days': 7 if chart_type == '7_day' else 14 if chart_type == '14_day' else 30,
            'prakriti_analysis': prakriti_analysis,
            'disease_analysis': disease_analysis,
            'target_calories': target_calories,
            'meal_distribution': meal_distribution,
            'daily_meals': daily_meals,
            'is_ai_generated': True,
            'generation_parameters': {
                'model_version': '1.0',
                'generated_at': date.today().isoformat(),
                'patient_analysis_included': bool(prakriti_analysis or disease_analysis)
            }
        }
        
        serializer = DietChartCreateSerializer(data=diet_chart_data)
        if serializer.is_valid():
            diet_chart = serializer.save(created_by=request.user)
            return Response(DietChartSerializer(diet_chart).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Failed to generate diet chart: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_sample_meals(chart_type, target_calories, meal_distribution):
    """Generate sample meals for the diet chart."""
    from datetime import date, timedelta
    
    days = 7 if chart_type == '7_day' else 14 if chart_type == '14_day' else 30
    daily_meals = {}
    
    # Sample meal templates
    meal_templates = {
        'breakfast': [
            {'name': 'Warm Oatmeal with Ghee', 'calories': 350, 'description': 'Hearty breakfast with healthy fats'},
            {'name': 'Almond Milk Porridge', 'calories': 320, 'description': 'Light and nutritious start to the day'},
            {'name': 'Millet Porridge with Nuts', 'calories': 380, 'description': 'Protein-rich morning meal'},
        ],
        'brunch': [
            {'name': 'Coconut Water & Dates', 'calories': 200, 'description': 'Refreshing mid-morning snack'},
            {'name': 'Fresh Fruit Bowl', 'calories': 180, 'description': 'Natural sweetness and vitamins'},
            {'name': 'Lassi with Honey', 'calories': 220, 'description': 'Probiotic-rich drink'},
        ],
        'lunch': [
            {'name': 'Kitchari with Vegetables', 'calories': 450, 'description': 'Balanced one-pot meal'},
            {'name': 'Quinoa & Vegetable Curry', 'calories': 420, 'description': 'Complete protein with vegetables'},
            {'name': 'Sambar & Rice', 'calories': 480, 'description': 'Traditional South Indian meal'},
        ],
        'snack': [
            {'name': 'Herbal Tea & Almonds', 'calories': 150, 'description': 'Antioxidant-rich afternoon snack'},
            {'name': 'Mint Tea & Crackers', 'calories': 120, 'description': 'Light digestive aid'},
            {'name': 'Cardamom Tea & Dates', 'calories': 140, 'description': 'Warming spice blend'},
        ],
        'dinner': [
            {'name': 'Light Dal & Rice', 'calories': 400, 'description': 'Easy-to-digest evening meal'},
            {'name': 'Steamed Vegetables & Roti', 'calories': 380, 'description': 'Simple and wholesome'},
            {'name': 'Vegetable Khichdi', 'calories': 350, 'description': 'Comforting one-pot meal'},
        ]
    }
    
    # Generate meals for each day
    for day in range(1, days + 1):
        day_key = f'day{day}'
        daily_meals[day_key] = {}
        
        for meal_type, percentage in meal_distribution.items():
            meal_calories = int(target_calories * percentage)
            meal_templates_for_type = meal_templates.get(meal_type, [])
            
            # Select a random meal template (for now, cycle through them)
            template_index = (day - 1) % len(meal_templates_for_type)
            selected_meal = meal_templates_for_type[template_index].copy()
            selected_meal['calories'] = meal_calories
            
            daily_meals[day_key][meal_type] = selected_meal
    
    return daily_meals


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_diet_chart_stats(request):
    """Get statistics about diet charts."""
    try:
        total_charts = DietChart.objects.count()
        active_charts = DietChart.objects.filter(status='active').count()
        completed_charts = DietChart.objects.filter(status='completed').count()
        draft_charts = DietChart.objects.filter(status='draft').count()
        
        # Charts by type
        charts_by_type = {}
        for chart_type, _ in DietChart.CHART_TYPE_CHOICES:
            charts_by_type[chart_type] = DietChart.objects.filter(chart_type=chart_type).count()
        
        # Recent charts (last 30 days)
        from datetime import date, timedelta
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_charts = DietChart.objects.filter(created_at__date__gte=thirty_days_ago).count()
        
        return Response({
            'total_charts': total_charts,
            'active_charts': active_charts,
            'completed_charts': completed_charts,
            'draft_charts': draft_charts,
            'charts_by_type': charts_by_type,
            'recent_charts': recent_charts
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch diet chart stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )