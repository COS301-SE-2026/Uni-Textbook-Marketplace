import { ValidationPipe } from '@nestjs/common';
import { EditListingDto } from './editListing.dtos';

describe('EditListingDto', () => {
  it('retains editable fields when the whitelist validation pipe transforms a request', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true });
    const request = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Updated listing',
      condition: 'good',
      annotation_level: 'light',
      price: '125',
      photo_urls: ['https://example.com/book.jpg'],
      has_notes: false,
      description: 'Updated description',
    };

    const result = await pipe.transform(request, {
      type: 'body',
      metatype: EditListingDto,
    });

    expect(result).toMatchObject({
      ...request,
      price: 125,
    });
  });
});
