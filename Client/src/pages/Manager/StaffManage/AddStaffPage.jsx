import { StaffFormPage } from '../../StaffManagement/StaffModule';

const AddStaffPage = () => (
  <StaffFormPage mode="create" scope="manager" basePath="/manager/staff" />
);

export default AddStaffPage;
