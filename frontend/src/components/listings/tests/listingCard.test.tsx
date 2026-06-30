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
    photo_urls: ['/image1.jpg'],
    created_at: '2026-06-18T10:00:00Z',
    book: {
        edition: 2,
        author: 'Test Author Name',
        isbn: '1234567890',
        title: 'Test Book',
    },
    module: {
        code: 'COS301',
        faculty: 'EBIT',
    },
    seller: {
        first_name: 'John',
        last_name: 'Doe',
        is_verified: true,
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

    it('renders condition', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/Good/)).toBeInTheDocument();
    });

    it('renders seller name and verified badge', () => {
        render(<ListingCard listing={mockListing} />);
        expect(screen.getByText(/John/)).toBeInTheDocument();
        expect(screen.getByText(/Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Verified/)).toBeInTheDocument();
    });

    it('navigates to listing detail on click', () => {
        render(<ListingCard listing={mockListing} />);
        const card = document.querySelector('.card');
        expect(card).toBeInTheDocument();
        fireEvent.click(card!);
        expect(mockPush).toHaveBeenCalledWith('/listings/123');
    });

    it('shows pending badge when showStatus is true and status is PENDING', () => {
        const pendingListing = { ...mockListing, status: 'PENDING' as const };
        render(<ListingCard listing={pendingListing} showStatus />);
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('does not show status badge when showStatus is false', () => {
        const pendingListing = { ...mockListing, status: 'PENDING' as const };
        render(<ListingCard listing={pendingListing} showStatus={false} />);
        expect(screen.queryByText('Pending')).not.toBeInTheDocument();
    });

    it('uses placeholder image when photo_urls is empty', () => {
        const noImageListing = { ...mockListing, photo_urls: [] };
        render(<ListingCard listing={noImageListing} />);
        const img = screen.getByAltText('Test Book');
        expect(img).toHaveAttribute('src', '/images/placeholder.png');
    });
});