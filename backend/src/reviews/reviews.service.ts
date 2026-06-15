import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const newReview = new this.reviewModel(createReviewDto);
    return await newReview.save();
  }

  async findAll(disciplineId?: string): Promise<Review[]> {
    if (disciplineId) {
      return this.reviewModel
        .find({ disciplineId })
        .sort({ createdAt: -1 })
        .exec();
    }
    return this.reviewModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Review | null> {
    return this.reviewModel.findById(id).exec();
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review | null> {
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, { $set: updateReviewDto }, { new: true })
      .exec();

    if (!updatedReview) {
      throw new BadRequestException(
        'Avaliação não encontrada para atualização.',
      );
    }

    return updatedReview;
  }

  async remove(id: string) {
    return this.reviewModel.findByIdAndDelete(id).exec();
  }
}
