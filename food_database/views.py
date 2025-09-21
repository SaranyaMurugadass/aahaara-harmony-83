import csv
import io
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import FoodItem
from .serializers import FoodItemSerializer, FoodItemCreateSerializer, FoodItemFilterSerializer
from authentication.models import User


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def food_items_list(request):
    """List all food items with filtering and pagination"""
    try:
        # Get filter parameters
        filters = FoodItemFilterSerializer(data=request.GET)
        if not filters.is_valid():
            return Response(filters.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Start with all food items
        queryset = FoodItem.objects.all()
        
        # Apply filters
        filter_data = filters.validated_data
        
        # Dosha effects
        if filter_data.get('vata_effect'):
            queryset = queryset.filter(vata_effect=filter_data['vata_effect'])
        if filter_data.get('pitta_effect'):
            queryset = queryset.filter(pitta_effect=filter_data['pitta_effect'])
        if filter_data.get('kapha_effect'):
            queryset = queryset.filter(kapha_effect=filter_data['kapha_effect'])
        
        # Meal types
        if filter_data.get('meal_types'):
            queryset = queryset.filter(meal_types__overlap=filter_data['meal_types'])
        
        # Food category
        if filter_data.get('food_category'):
            queryset = queryset.filter(food_category__icontains=filter_data['food_category'])
        
        # Tags
        if filter_data.get('tags'):
            queryset = queryset.filter(tags__overlap=filter_data['tags'])
        
        # Rasa
        if filter_data.get('rasa'):
            queryset = queryset.filter(rasa__overlap=filter_data['rasa'])
        
        # Guna
        if filter_data.get('guna'):
            queryset = queryset.filter(guna__overlap=filter_data['guna'])
        
        # Virya
        if filter_data.get('virya'):
            queryset = queryset.filter(virya=filter_data['virya'])
        
        # Search
        if filter_data.get('search'):
            search_term = filter_data['search']
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(food_category__icontains=search_term) |
                Q(tags__icontains=search_term)
            )
        
        # Nutritional filters
        if filter_data.get('min_calories'):
            queryset = queryset.filter(calories__gte=filter_data['min_calories'])
        if filter_data.get('max_calories'):
            queryset = queryset.filter(calories__lte=filter_data['max_calories'])
        if filter_data.get('min_protein'):
            queryset = queryset.filter(protein_g__gte=filter_data['min_protein'])
        if filter_data.get('max_protein'):
            queryset = queryset.filter(protein_g__lte=filter_data['max_protein'])
        
        # Pagination
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize the results
        serializer = FoodItemSerializer(page_obj, many=True)
        
        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number,
            'next': page_obj.has_next(),
            'previous': page_obj.has_previous(),
            'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
            'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching food items: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def food_item_detail(request, food_id):
    """Get details of a specific food item"""
    try:
        food_item = FoodItem.objects.get(id=food_id)
        serializer = FoodItemSerializer(food_item)
        return Response(serializer.data)
    except FoodItem.DoesNotExist:
        return Response(
            {'error': 'Food item not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching food item: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_food_item(request):
    """Create a new food item"""
    try:
        # Only doctors can create food items
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can create food items'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = FoodItemCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Set the creator
            food_item = serializer.save(created_by=request.user)
            response_serializer = FoodItemSerializer(food_item)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Error creating food item: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_food_item(request, food_id):
    """Update a food item"""
    try:
        # Only doctors can update food items
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can update food items'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            food_item = FoodItem.objects.get(id=food_id)
        except FoodItem.DoesNotExist:
            return Response(
                {'error': 'Food item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = FoodItemCreateSerializer(
            food_item, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = FoodItemSerializer(food_item)
            return Response(response_serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Error updating food item: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_food_item(request, food_id):
    """Delete a food item"""
    try:
        # Only doctors can delete food items
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can delete food items'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            food_item = FoodItem.objects.get(id=food_id)
            food_item.delete()
            return Response({'message': 'Food item deleted successfully'})
        except FoodItem.DoesNotExist:
            return Response(
                {'error': 'Food item not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {'error': f'Error deleting food item: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_csv_foods(request):
    """Import food items from CSV file"""
    try:
        # Only doctors can import food items
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Only doctors can import food items'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'csv_file' not in request.FILES:
            return Response(
                {'error': 'No CSV file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        csv_file = request.FILES['csv_file']
        
        # Read CSV content
        csv_content = csv_file.read().decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        imported_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # Start from 2 because of header
            try:
                # Parse the data
                food_data = {
                    'name': row['name'],
                    'serving_size': row['serving_size'],
                    'calories': int(float(row['calories'])),
                    'protein_g': float(row['protein_g']),
                    'carbs_g': float(row['carbs_g']),
                    'fat_g': float(row['fat_g']),
                    'fiber_g': float(row['fiber_g']),
                    'rasa': [r.strip() for r in row['rasa'].split(';') if r.strip()],
                    'guna': [g.strip() for g in row['guna'].split(';') if g.strip()],
                    'virya': row['virya'].strip(),
                    'vata_effect': row['vata_effect'].strip(),
                    'pitta_effect': row['pitta_effect'].strip(),
                    'kapha_effect': row['kapha_effect'].strip(),
                    'meal_types': [m.strip() for m in row['meal_type'].split(';') if m.strip()],
                    'food_category': row['food_category'].strip(),
                    'tags': [t.strip() for t in row['tags'].split(';') if t.strip()],
                }
                
                # Create the food item
                serializer = FoodItemCreateSerializer(data=food_data)
                if serializer.is_valid():
                    serializer.save(created_by=request.user)
                    imported_count += 1
                else:
                    errors.append(f"Row {row_num}: {serializer.errors}")
                    
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return Response({
            'message': f'Successfully imported {imported_count} food items',
            'imported_count': imported_count,
            'errors': errors[:10],  # Limit errors to first 10
            'total_errors': len(errors)
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error importing CSV: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def food_categories(request):
    """Get all unique food categories"""
    try:
        categories = FoodItem.objects.values_list('food_category', flat=True).distinct()
        return Response({'categories': list(categories)})
    except Exception as e:
        return Response(
            {'error': f'Error fetching categories: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def food_stats(request):
    """Get food database statistics"""
    try:
        total_foods = FoodItem.objects.count()
        
        # Dosha statistics
        vata_pacifying = FoodItem.objects.filter(vata_effect='pacifies').count()
        pitta_pacifying = FoodItem.objects.filter(pitta_effect='pacifies').count()
        kapha_pacifying = FoodItem.objects.filter(kapha_effect='pacifies').count()
        
        # Tridoshic foods
        tridoshic = FoodItem.objects.filter(
            vata_effect='pacifies',
            pitta_effect='pacifies',
            kapha_effect='pacifies'
        ).count()
        
        # Meal type statistics
        meal_stats = {}
        for meal_type in ['Breakfast', 'Brunch', 'Lunch', 'Snacks', 'Dinner']:
            meal_stats[meal_type] = FoodItem.objects.filter(meal_types__contains=[meal_type]).count()
        
        return Response({
            'total_foods': total_foods,
            'dosha_stats': {
                'vata_pacifying': vata_pacifying,
                'pitta_pacifying': pitta_pacifying,
                'kapha_pacifying': kapha_pacifying,
                'tridoshic': tridoshic
            },
            'meal_stats': meal_stats
        })
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


