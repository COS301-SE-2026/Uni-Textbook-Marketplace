import { render, screen, fireEvent, waitFor } from '@/test-utils';
import ListingCard from '../listingCard';
import { useRouter } from 'next/navigation';
import { save, remove } from '@/lib/wishlist.api';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(() => '/'),
}));

jest.mock('@/lib/wishlist.api', () => ({
    save: jest.fn(),
    remove: jest.fn(),
}));

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        const { fill, ...rest } = props as { fill?: boolean };
        return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
    },
}));

const mockListing = {
    id: '123',
    title: 'Test Book',
    price: 450,
    condition: 'good' as const,
    annotation_level: 'light' as const,
    status: 'APPROVED' as const,
    listing_status: 'AVAILABLE' as const,
    photo_urls: ['/image1.jpg'],
    created_at: '2026-06-18T10:00:00Z',
    description: 'This is a test description for the book.',
    book: {
        edition: 2,
        author: 'Test Author Name',
        isbn: '1234567890',
        title: 'Test Book',
        publisher: 'Test Publisher',
    },
    module: {
        name: 'Software Engineering',
        code: 'COS301',
        semester: 1,
        faculty: {
            name: 'EBIT'
        },
    },
    seller: {
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true,
        university: {
            name: 'University of Pretoria'
        },
    },
};

describe('ListingCard', () => {
    const mockPush = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (save as jest.Mock).mockResolvedValue(undefined);
        (remove as jest.Mock).mockResolvedValue(undefined);
    });

    it('renders listing title and price', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/Test Book/)).toBeInTheDocument();
        expect(screen.getByText(/R450.00/)).toBeInTheDocument();
    });

    it('renders edition and module code', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/2nd Edition/)).toBeInTheDocument();
        expect(screen.getByText(/COS301/)).toBeInTheDocument();
    });

    it('renders condition badge', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText('Good')).toBeInTheDocument();
    });

    it('renders seller name and verified badge', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/John/)).toBeInTheDocument();
        expect(screen.getByText(/Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Verified/)).toBeInTheDocument();
    });

    it('navigates to listing detail on click', () => {
        render(<ListingCard listing={mockListing} />);
        const card = document.querySelector('.group');
        expect(card).toBeInTheDocument();
        fireEvent.click(card!);
        expect(mockPush).toHaveBeenCalledWith('/listings/123');
    });

    it('shows pending badge when showStatus is true and status is PENDING', () => {
        const pendingListing = { ...mockListing, status: 'PENDING' as const };
        render(<ListingCard listing={pendingListing} showStatus={true} />);

        const pendingBadge = screen.getByText('Pending');
        expect(pendingBadge).toBeInTheDocument();
        expect(pendingBadge).toHaveClass('badge-pending');
    });

    it('shows rejected badge when showStatus is true and status is REJECTED', () => {
        const rejectedListing = { ...mockListing, status: 'REJECTED' as const };
        render(<ListingCard listing={rejectedListing} showStatus={true} />);
        expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('does not show status badge when showStatus is false', () => {
        const pendingListing = { ...mockListing, status: 'PENDING' as const };
        render(<ListingCard listing={pendingListing} showStatus={false} />);
        expect(screen.queryByText('Pending')).not.toBeInTheDocument();
        expect(screen.queryByText('Rejected')).not.toBeInTheDocument();
    });

    it('shows reserved badge when listing_status is RESERVED and status is APPROVED', () => {
        const reservedListing = {
            ...mockListing,
            listing_status: 'RESERVED' as const,
            status: 'APPROVED' as const,
        };
        render(<ListingCard listing={reservedListing} showStatus={false} />);
        expect(screen.getByText('Reserved')).toBeInTheDocument();
    });

    it('shows sold badge when listing_status is SOLD and status is APPROVED', () => {
        const soldListing = {
            ...mockListing,
            listing_status: 'SOLD' as const,
            status: 'APPROVED' as const,
        };
        render(<ListingCard listing={soldListing} showStatus={false} />);
        expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    it('uses placeholder image when photo_urls is empty', () => {
        const noImageListing = { ...mockListing, photo_urls: [] };
        render(<ListingCard listing={noImageListing} />);
        const img = screen.getByAltText('Test Book');
        expect(img).toHaveAttribute('src', '/images/placeholder.png');
    });

    it('does not navigate when removeClick is true', () => {
        render(<ListingCard listing={mockListing} removeClick={true} />);
        const card = document.querySelector('.group');
        expect(card).toBeInTheDocument();
        fireEvent.click(card!);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles like button click', async () => {
        render(<ListingCard listing={mockListing} />);
        const likeButton = screen.getByRole('button', { name: /like/i });
        expect(likeButton).toBeInTheDocument();
        fireEvent.click(likeButton);
        expect(likeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders different condition badges correctly', () => {
        const conditions: Array<'new' | 'good' | 'fair' | 'poor'> = ['new', 'good', 'fair', 'poor'];
        const conditionLabels = ['New', 'Good', 'Fair', 'Poor'];

        conditions.forEach((condition, index) => {
            const listing = { ...mockListing, condition };
            render(<ListingCard listing={listing} />);
            expect(screen.getByText(conditionLabels[index])).toBeInTheDocument();
        });
    });

    it.each([
        [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'],
        [11, '11th'], [12, '12th'], [13, '13th'],
        [21, '21st'], [22, '22nd'], [23, '23rd'],
    ])('renders edition %i as %s', (edition, label) => {
        const listing = { ...mockListing, book: { ...mockListing.book, edition } };
        render(<ListingCard listing={listing} />);
        expect(screen.getByText(new RegExp(`${label} Edition`))).toBeInTheDocument();
    });

    it('converts ./ prefixed photo urls to root-relative', () => {
        const listing = { ...mockListing, photo_urls: ['./images/cover.jpg'] };
        render(<ListingCard listing={listing} />);
        expect(screen.getByAltText('Test Book')).toHaveAttribute('src', '/images/cover.jpg');
    });

    it('passes through absolute http photo urls', () => {
        const listing = { ...mockListing, photo_urls: ['https://cdn/x.jpg'] };
        render(<ListingCard listing={listing} />);
        expect(screen.getByAltText('Test Book')).toHaveAttribute('src', 'https://cdn/x.jpg');
    });

    it('calls save and dispatches wishlist:changed when liking', async () => {
        const spy = jest.spyOn(window, 'dispatchEvent');
        render(<ListingCard listing={mockListing} />);
        fireEvent.click(screen.getByRole('button', { name: /like/i }));
        await waitFor(() => expect(save).toHaveBeenCalledWith('123'));
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'wishlist:changed' }),
        );
    });

    it('calls remove when unliking', async () => {
        render(<ListingCard listing={mockListing} isLiked />);
        fireEvent.click(screen.getByRole('button', { name: /like/i }));
        await waitFor(() => expect(remove).toHaveBeenCalledWith('123'));
    });

    it('rolls back the like state when the API fails', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        (save as jest.Mock).mockRejectedValueOnce(new Error('boom'));
        render(<ListingCard listing={mockListing} />);
        const btn = screen.getByRole('button', { name: /like/i });
        fireEvent.click(btn);
        await waitFor(() =>
            expect(btn).toHaveAttribute('aria-pressed', 'false'),
        );
    });

    it('hides the seller row when seller is absent', () => {
        const listing = { ...mockListing, seller: undefined };
        render(<ListingCard listing={listing} />);
        expect(screen.queryByText(/John/)).not.toBeInTheDocument();
    });
});