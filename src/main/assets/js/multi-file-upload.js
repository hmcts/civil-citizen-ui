import { MultiFileUpload } from '@ministryofjustice/frontend';

/**
 * Spike: initialise MOJ MultiFileUpload where present.
 * Not included in MOJ initAll(), so must be created manually with upload/delete URLs.
 */
document.querySelectorAll('[data-module="moj-multi-file-upload"]').forEach((element) => {
  const uploadUrl = element.getAttribute('data-upload-url');
  const deleteUrl = element.getAttribute('data-delete-url');
  if (!uploadUrl || !deleteUrl) {
    return;
  }
  // eslint-disable-next-line no-new
  new MultiFileUpload(element, { uploadUrl, deleteUrl });
});
