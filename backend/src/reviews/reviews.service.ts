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
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('A nota deve estar entre 1 e 5.');
    }

    const newReview = new this.reviewModel(createReviewDto);
    return newReview.save();
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  async findByMaterial(materialId: string): Promise<Review[]> {
    return this.reviewModel.find({ materialId }).exec();
  }

  async findOne(id: string): Promise<Review | null> {
    return this.reviewModel.findById(id).exec();
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review | null> {
    if (updateReviewDto.rating !== undefined) {
      if (updateReviewDto.rating < 1 || updateReviewDto.rating > 5) {
        throw new BadRequestException(
          'A nota atualizada deve estar entre 1 e 5.',
        );
      }
    }

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
