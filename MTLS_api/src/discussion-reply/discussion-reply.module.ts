import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionReplyService } from './discussion-reply.service';
import { DiscussionReplyController } from './discussion-reply.controller';
import { DiscussionReply, DiscussionReplySchema } from './schemas/discussion-reply.schema';
import { DiscussionModule } from '../discussion/discussion.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscussionReply.name, schema: DiscussionReplySchema }
    ]),
    DiscussionModule
  ],
  controllers: [DiscussionReplyController],
  providers: [DiscussionReplyService],
  exports: [DiscussionReplyService]
})
export class DiscussionReplyModule {} 