import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  @Delete('deleteMember')
  @ApiOperation({
    summary: '회원탈퇴',
    description: 'TB_MY_PRODCUT && TB_MEMBER 에 있는 회원 정보를 삭제합니다.',
  })
  @ApiQuery({ name: 'deviceToken', required: true})
  @ApiResponse({
    status: 200,
    description: '탈퇴 성공',
    schema: {
      example: {
        message: '회원(20250324014035000000) 및 관련 제품이 삭제되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 회원일 경우',
    schema: {
      example: {
        statusCode: 404,
        message: '존재하지 않는 회원입니다.',
        error: 'Not Found',
      },
    },
  })
  async deleteMember(@Query('deviceToken') deviceToken: string) {
    return this.memberService.deleteMember(deviceToken);
  }
  

}
