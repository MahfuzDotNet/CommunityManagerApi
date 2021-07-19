import IClub from "./clubInterface";
import IMember from "./memberInteface";

interface IClubDetail {
    id: string,
    clubId: string,
    clubName: String,
    memberId: string,
    memberName: string,
    memberSurname: string,
}

export default IClubDetail