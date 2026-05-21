import { StaffFormPage } from '../../StaffManagement/StaffModule';

const AddStaffPage = () => (
  <StaffFormPage mode="create" scope="hr" basePath="/hr/staff" />
);

export default AddStaffPage;
