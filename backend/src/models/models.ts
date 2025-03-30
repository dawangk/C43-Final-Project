/* 
* Define all database models here
*/

interface BaseModel {
  created_at: string;
  updated_at: string;
}

export interface UserModel extends BaseModel {
  username: string;
  email: string;
}