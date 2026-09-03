import { render, screen, fireEvent } from '@/test-utils';
import ListingCard from '../listingCard';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(() => '/'),
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
    });

    it('renders listing title and price', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/Test Book/)).toBeInTheDocument();
        expect(screen.getByText(/R450.00/)).toBeInTheDocument();
    });

    it('renders edition and module code', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/2 Edition/)).toBeInTheDocument();
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
});