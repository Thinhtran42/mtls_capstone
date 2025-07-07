import { PartialType } from '@nestjs/swagger';
import { CreateDiscussionReplyDto } from './create-discussion-reply.dto';

export class UpdateDiscussionReplyDto extends PartialType(CreateDiscussionReplyDto) {} 