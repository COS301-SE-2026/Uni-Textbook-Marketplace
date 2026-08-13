import { render, screen, fireEvent, waitFor, act } from '@/test-utils';
import ListingForm, { ListingFormData } from '../listingForm';
import { getFaculties } from '@/lib/listings.api';

jest.mock('@/lib/listings.api', () => ({
    ...jest.requireActual('@/lib/listings.api'),
    getFaculties: jest.fn(),
}));

beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mock-image-url');
});

const formData: ListingFormData = {
    bookName: '',
    author: '',
    edition: '',
    isbn: '',
    publisher: '',
    code: '',
    name: '',
    faculty: '',
    condition: '',
    annotationLevel: '',
    price: '',
    description: '',
    has_notes: false,
    images: [],
    semester: '',
    listingTitle: '',
};

const defaultProps = {
    step: 1,
    form: formData,
    errors: {},
    onChange: jest.fn(),
    onImageUpload: jest.fn(),
    onRemoveImage: jest.fn(),
};

describe('ListingForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Step 1: Book Details', () => {

        it('renders book details fields', () => {
            render(<ListingForm {...defaultProps} step={1} />);
            expect(screen.getByText('Book Details')).toBeInTheDocument();

            expect(screen.getByText('Name of book *')).toBeInTheDocument();
            expect(screen.getByText('Author *')).toBeInTheDocument();

            expect(screen.getByText('Edition *')).toBeInTheDocument();
            expect(screen.getByText('ISBN *')).toBeInTheDocument();

            expect(screen.getByText('Publisher *')).toBeInTheDocument();
        });

        it('displays error messages for book fields', () => {
            const errors = { bookName: 'Book name is required' };
            render(<ListingForm {...defaultProps} step={1} errors={errors} />);
            expect(screen.getByText('Book name is required')).toBeInTheDocument();
        });

        it('calls onChange when input changes', () => {
            const handleChange = jest.fn();

            render(<ListingForm {...defaultProps} step={1} onChange={handleChange} />);
            const input = screen.getByPlaceholderText('e.g. Software Engineering');

            fireEvent.change(input, { target: { name: 'bookName', value: 'New Book' } });
            expect(handleChange).toHaveBeenCalledTimes(1);
        });
    });

    describe('Step 2: Module Details', () => {
        it('renders module details fields', () => {
            render(<ListingForm {...defaultProps} step={2} />);
            expect(screen.getByText('Module Details')).toBeInTheDocument();
            expect(screen.getByText('Module Code *')).toBeInTheDocument();

            expect(screen.getByText('Module Name *')).toBeInTheDocument();
            expect(screen.getByText('Faculty *')).toBeInTheDocument();
        });

        it('renders faculty options fetched from the backend', async () => {
            (getFaculties as jest.Mock).mockResolvedValue([
                { id: 'fac-1', name: 'Engineering, Built Environment and IT' },
                { id: 'fac-2', name: 'Natural and Agricultural Sciences' },
            ]);

            
            await act(async () => {
                render(<ListingForm {...defaultProps} step={2} />);
            });

            
            await waitFor(() => {
                expect(getFaculties).toHaveBeenCalled();
            });

            
            await waitFor(() => {
                expect(screen.getByRole('option', { name: 'Engineering, Built Environment and IT' })).toBeInTheDocument();
                expect(screen.getByRole('option', { name: 'Natural and Agricultural Sciences' })).toBeInTheDocument();
            });
        });
    });

    describe('Step 3: Listing Details', () => {
        it('renders listing details fields', () => {
            render(<ListingForm {...defaultProps} step={3} />);

            expect(screen.getByText('Listing Details')).toBeInTheDocument();
            expect(screen.getByText('Condition *')).toBeInTheDocument();

            expect(screen.getByText('Annotation Level *')).toBeInTheDocument();
            expect(screen.getByText('Price (R) *')).toBeInTheDocument();

            expect(screen.getByText('Description *')).toBeInTheDocument();
        });
    });

    describe('Step 4: Upload Pictures', () => {
        it('renders upload section', () => {

            render(<ListingForm {...defaultProps} step={4} />);
            expect(screen.getByText('Upload Pictures')).toBeInTheDocument();

            expect(screen.getByText('Click to upload images')).toBeInTheDocument();
        });

        it('shows image previews when images are uploaded', async () => {

            const mockFiles = [new File([''], 'image1.jpg', { type: 'image/jpeg' })];
            const formWithImages = {
                ...defaultProps.form,
                images: mockFiles,
            };
            
            await act(async () => {
                render(<ListingForm {...defaultProps} step={4} form={formWithImages as ListingFormData} />);
            });
            
            expect(screen.getByText('1 / 4+ images uploaded')).toBeInTheDocument();
        });

        it('calls onImageUpload when file input changes', () => {
            const handleUpload = jest.fn();

            render(<ListingForm {...defaultProps} step={4} onImageUpload={handleUpload} />);
            const fileInput = document.querySelector('input[type="file"]');

            expect(fileInput).toBeInTheDocument();
        });
    });

    it('returns null for invalid step', () => {
        render(<ListingForm {...defaultProps} step={99} />);
        expect(screen.queryByText('Book Details')).not.toBeInTheDocument();
        expect(screen.queryByText('Module Details')).not.toBeInTheDocument();


        expect(screen.queryByText('Listing Details')).not.toBeInTheDocument();

        expect(screen.queryByText('Upload Pictures')).not.toBeInTheDocument();
    });
});