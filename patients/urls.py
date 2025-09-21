from django.urls import path
from .views import (
    patient_list,
    patient_detail,
    create_patient,
    patient_summary,
    assign_doctor,
    prakriti_analysis_list_create,
    disease_analysis_list_create,
    consultation_list_create,
    PatientReportListCreateView,
    PatientReportDetailView,
    PatientReportSummaryListView,
    upload_patient_report,
    download_patient_report,
    get_patient_reports,
    get_report_stats,
    ReportCommentListCreateView,
    ReportShareListCreateView
)

urlpatterns = [
    # Main patient endpoints
    path('', patient_list, name='patient-list'),
    path('<int:pk>/', patient_detail, name='patient-detail'),
    path('create/', create_patient, name='create-patient'),
    path('<uuid:patient_id>/summary/', patient_summary, name='patient-summary'),
    path('<uuid:patient_id>/assign-doctor/', assign_doctor, name='assign-doctor'),
    
    # Patient analysis endpoints
    path('<uuid:patient_id>/prakriti/', prakriti_analysis_list_create, name='prakriti-analysis'),
    path('<uuid:patient_id>/diseases/', disease_analysis_list_create, name='disease-analysis'),
    path('<uuid:patient_id>/consultations/', consultation_list_create, name='consultations'),
    
    # Report CRUD endpoints
    path('reports/', PatientReportListCreateView.as_view(), name='report-list-create'),
    path('reports/summaries/', PatientReportSummaryListView.as_view(), name='report-summaries'),
    path('reports/<uuid:id>/', PatientReportDetailView.as_view(), name='report-detail'),
    path('reports/<uuid:id>/update/', PatientReportDetailView.as_view(), name='report-update'),
    path('reports/<uuid:id>/delete/', PatientReportDetailView.as_view(), name='report-delete'),
    
    # Report file operations
    path('reports/upload/', upload_patient_report, name='report-upload'),
    path('reports/<uuid:report_id>/download/', download_patient_report, name='report-download'),
    
    # Patient-specific endpoints
    path('reports/patient/<uuid:patient_id>/', get_patient_reports, name='patient-reports'),
    
    # Statistics endpoint
    path('reports/stats/', get_report_stats, name='report-stats'),
    
    # Report comments
    path('reports/<uuid:report_id>/comments/', ReportCommentListCreateView.as_view(), name='report-comments'),
    
    # Report sharing
    path('reports/<uuid:report_id>/shares/', ReportShareListCreateView.as_view(), name='report-shares'),
]