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
  
  @Patch('updateName')
  @ApiOperation({ summary: '회원 이름 수정', description: '회원가입 시 회원의 이름을 입력받습니다.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        memberNo: { type: 'string', example: '20250320180759000000', description: '회원 번호' },
        memberName: { type: 'string', example: '홍길동', description: '회원 이름' },
      },
      required: ['memberNo', 'memberName'],
    },
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '입력값 유효성 실패' })
  @ApiResponse({ status: 404, description: '해당 회원을 찾을 수 없음' })
  async updateMemberName(@Body() body: any) {
    return this.memberService.updateMemberName(body.memberNo, body.memberName);
  }
  

}
