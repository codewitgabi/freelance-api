import { Controller, Get, Body, Param, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
// import { UpdateUserDto } from "./dto/update-user.dto";
import SuccessResponse from "src/common/responses/success-response";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const data = await this.userService.findOne(+id);

    return SuccessResponse({
      message: "User profile fetched successfully",
      data,
    });
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
