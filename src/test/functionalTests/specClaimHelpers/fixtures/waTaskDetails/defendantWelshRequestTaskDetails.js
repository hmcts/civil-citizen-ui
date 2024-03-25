module.exports = {
    name: 'Defendant Welsh Request',
    type: 'defendantWelshRequest',
    task_state: 'unassigned',
    task_system: 'SELF',
    security_classification: 'PUBLIC',
    task_title: 'Defendant Welsh Request',
    created_date: '2024-03-15T17:41:42+0000',
    due_date: '2024-04-16T16:00:00+0000',
    location_name: '',
    location: '420219',
    execution_type: 'Case Management Task',
    jurisdiction: 'CIVIL',
    region: '2',
    case_type_id: 'CIVIL',
    case_id: '1710524210293872',
    case_category: 'Civil',
    case_name: 'Test Inc',
    auto_assigned: false,
    warnings: false,
    warning_list: { values: [] },
    case_management_category: 'Civil',
    work_type_id: 'routine_work',
    work_type_label: 'Routine work',
    permissions: { 
      values: [
        'Read',          'Own',
        'Manage',        'Cancel',
        'CompleteOwn',   'CancelOwn',
        'Claim',         'Unclaim',
        'Assign',        'Unassign',
        'UnclaimAssign'
      ]
    },
    description: '[Upload Translated Documents](/cases/case-details/${[CASE_REFERENCE]}/trigger/UPLOAD_TRANSLATED_DOCUMENT/UPLOAD_TRANSLATED_DOCUMENTUploadTranslatedDocument)',
    role_category: 'CTSC',
    minor_priority: 500,
    major_priority: 5000,
  };