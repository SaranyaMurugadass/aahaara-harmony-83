"""
Views for diet chart management
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import FoodItem, DietChart, MealPlan, MealItem, DietRecommendation
from .serializers import (
    FoodItemSerializer,
    DietChartSerializer,
    DietChartCreateSerializer,
    MealPlanSerializer,
    MealPlanCreateSerializer,
    DietRecommendationSerializer
)
from patients.models import Patient, PrakritiAnalysis
from authentication.models import DoctorProfile, UnifiedProfile, UnifiedPatient

class FoodItemListView(generics.ListAPIView):
    """List food items with search and filter capabilities"""
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = FoodItem.objects.all()
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by dosha effect
        dosha = self.request.query_params.get('dosha', None)
        effect = self.request.query_params.get('effect', None)
        if dosha and effect:
            if dosha == 'vata':
                queryset = queryset.filter(vata_effect=effect)
            elif dosha == 'pitta':
                queryset = queryset.filter(pitta_effect=effect)
            elif dosha == 'kapha':
                queryset = queryset.filter(kapha_effect=effect)
        
        return queryset

class DietChartListCreateView(generics.ListCreateAPIView):
    """List and create diet charts"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DietChartCreateSerializer
        return DietChartSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'doctor':
            doctor_profile = get_object_or_404(UnifiedProfile, user=user, profile_type='doctor')
            return DietChart.objects.filter(created_by=doctor_profile)
        elif user.role == 'patient':
            unified_patient = get_object_or_404(UnifiedPatient, user=user)
            return DietChart.objects.filter(patient=unified_patient)
        return DietChart.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role == 'doctor':
            doctor_profile = get_object_or_404(UnifiedProfile, user=self.request.user, profile_type='doctor')
            serializer.save(created_by=doctor_profile)

class DietChartDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a diet chart"""
    serializer_class = DietChartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'doctor':
            doctor_profile = get_object_or_404(UnifiedProfile, user=user, profile_type='doctor')
            return DietChart.objects.filter(created_by=doctor_profile)
        elif user.role == 'patient':
            unified_patient = get_object_or_404(UnifiedPatient, user=user)
            return DietChart.objects.filter(patient=unified_patient)
        return DietChart.objects.none()

class MealPlanListCreateView(generics.ListCreateAPIView):
    """List and create meal plans for a diet chart"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MealPlanCreateSerializer
        return MealPlanSerializer
    
    def get_queryset(self):
        diet_chart_id = self.kwargs.get('diet_chart_id')
        user = self.request.user
        
        # Check if user has access to this diet chart
        if user.role == 'doctor':
            doctor_profile = get_object_or_404(UnifiedProfile, user=user, profile_type='doctor')
            diet_chart = get_object_or_404(DietChart, id=diet_chart_id, created_by=doctor_profile)
        elif user.role == 'patient':
            unified_patient = get_object_or_404(UnifiedPatient, user=user)
            diet_chart = get_object_or_404(DietChart, id=diet_chart_id, patient=unified_patient)
        else:
            return MealPlan.objects.none()
        
        return MealPlan.objects.filter(diet_chart=diet_chart)
    
    def perform_create(self, serializer):
        diet_chart_id = self.kwargs.get('diet_chart_id')
        diet_chart = get_object_or_404(DietChart, id=diet_chart_id)
        serializer.save(diet_chart=diet_chart)

class DietRecommendationListView(generics.ListAPIView):
    """List diet recommendations based on dosha"""
    serializer_class = DietRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        dosha_type = self.request.query_params.get('dosha_type', None)
        
        if dosha_type:
            return DietRecommendation.objects.filter(dosha_type=dosha_type)
        return DietRecommendation.objects.all()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_diet_chart(request):
    """Generate a diet chart based on patient's Prakriti and health conditions"""
    if request.user.role != 'doctor':
        return Response({'error': 'Only doctors can generate diet charts'}, status=status.HTTP_403_FORBIDDEN)
    
    patient_id = request.data.get('patient_id')
    chart_name = request.data.get('chart_name')
    chart_type = request.data.get('chart_type', 'therapeutic')
    duration_days = request.data.get('duration_days', 30)
    
    try:
        # Get unified patient
        unified_patient = get_object_or_404(UnifiedPatient, id=patient_id)
        doctor_profile = get_object_or_404(UnifiedProfile, user=request.user, profile_type='doctor')
        
        # Get patient's latest Prakriti analysis
        latest_prakriti = PrakritiAnalysis.objects.filter(patient=unified_patient).order_by('-analysis_date').first()
        
        if not latest_prakriti:
            return Response({'error': 'Patient needs Prakriti analysis first'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create diet chart
        diet_chart = DietChart.objects.create(
            patient=unified_patient,
            chart_name=chart_name,
            chart_type=chart_type,
            duration_days=duration_days,
            created_by=doctor_profile,
            description=f"Diet chart for {latest_prakriti.primary_dosha} constitution"
        )
        
        # Get food recommendations based on dosha
        primary_dosha = latest_prakriti.primary_dosha
        
        # This is a simplified version - in a real app, you'd have more sophisticated logic
        if primary_dosha in ['vata', 'vata-pitta', 'vata-kapha']:
            # Foods that balance Vata
            recommended_foods = FoodItem.objects.filter(
                Q(vata_effect='vata_-') | Q(vata_effect='neutral')
            )[:10]
        elif primary_dosha in ['pitta', 'pitta-kapha']:
            # Foods that balance Pitta
            recommended_foods = FoodItem.objects.filter(
                Q(pitta_effect='pitta_-') | Q(pitta_effect='neutral')
            )[:10]
        elif primary_dosha in ['kapha']:
            # Foods that balance Kapha
            recommended_foods = FoodItem.objects.filter(
                Q(kapha_effect='kapha_-') | Q(kapha_effect='neutral')
            )[:10]
        else:
            # Tridosha - balanced approach
            recommended_foods = FoodItem.objects.filter(
                vata_effect='neutral',
                pitta_effect='neutral',
                kapha_effect='neutral'
            )[:10]
        
        # Create sample meal plans
        meal_types = ['breakfast', 'lunch', 'dinner']
        for i, meal_type in enumerate(meal_types):
            meal_plan = MealPlan.objects.create(
                diet_chart=diet_chart,
                meal_type=meal_type,
                meal_name=f"{meal_type.title()} for {primary_dosha}",
                timing=f"{8 + i*4}:00:00",
                day_of_week=1
            )
            
            # Add 2-3 food items to each meal
            for j, food in enumerate(recommended_foods[i*2:(i+1)*2]):
                MealItem.objects.create(
                    meal_plan=meal_plan,
                    food_item=food,
                    quantity=f"{1 + j} serving",
                    notes=f"Good for {primary_dosha} constitution"
                )
        
        return Response({
            'message': 'Diet chart generated successfully',
            'diet_chart': DietChartSerializer(diet_chart).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def food_database(request):
    """Get food database with categories and dosha effects"""
    categories = FoodItem.CATEGORY_CHOICES
    dosha_effects = FoodItem.DOSHA_EFFECT_CHOICES
    
    # Get sample foods for each category
    food_by_category = {}
    for category_code, category_name in categories:
        foods = FoodItem.objects.filter(category=category_code)[:5]
        food_by_category[category_code] = {
            'name': category_name,
            'foods': FoodItemSerializer(foods, many=True).data
        }
    
    return Response({
        'categories': categories,
        'dosha_effects': dosha_effects,
        'food_by_category': food_by_category
    }, status=status.HTTP_200_OK)