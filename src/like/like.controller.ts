import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserPayloadModel } from '../auth/types/user.model';

@ApiTags('like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/work/:workId')
  create(
    @Param('workId', ParseIntPipe) workId: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.likeService.createLike(workId, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayloadModel,
  ) {
    return this.likeService.deleteLike(id, user);
  }
}
