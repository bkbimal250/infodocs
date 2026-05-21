import { StaffFormPage } from '../../StaffManagement/StaffModule';

const AddStaffForm = () => (
  <StaffFormPage mode="create" scope="admin" basePath="/admin/staff" />
);

export default AddStaffForm;
