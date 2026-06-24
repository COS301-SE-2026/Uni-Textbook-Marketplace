import { render, screen, fireEvent } from '@/test-utils';
import ListingForm from '../listingForm';

const defaultProps = {
    step: 1,
    form: {
        title: '', author: '',
        edition: '', isbn: '',
        publisher: '', code: '',
        name: '', faculty: '',
        condition: '', annotationLevel: '',
        price: '', description: '',
        images: [], 
    },
    errors: {},
    onChange: jest.fn(),
    onImageUpload: jest.fn(),
    onRemoveImage: jest.fn(),
};

describe('ListingForm', () => {
    describe('Step 1: Book Details', () => {
        it('renders book details fields', () => {
            render(<ListingForm {...defaultProps} step={1} />);
            expect(screen.getByText('Book Details')).toBeInTheDocument();
            expect(screen.getByLabelText('Title *')).toBeInTheDocument();
            expect(screen.getByLabelText('Author *')).toBeInTheDocument();
            expect(screen.getByLabelText('Edition *')).toBeInTheDocument();
            expect(screen.getByLabelText('ISBN *')).toBeInTheDocument();
            expect(screen.getByLabelText('Publisher *')).toBeInTheDocument();
        });

        it('displays error messages for book fields', () => {
            const errors = {title: 'Title is required'};
            render(<ListingForm {...defaultProps} step={1} errors={errors} />);
            expect(screen.getByText('Title is required')).toBeInTheDocument();
        });

        it('calls onChange when input changes', () => {
            const handleChange = jest.fn();
            render(<ListingForm {...defaultProps} step={1} onChange={handleChange} />);
            const input = screen.getByLabelText('Title *');
            fireEvent.change(input, { target: { name: 'title', value: 'New Book' } });
            expect(handleChange).toHaveBeenCalledTimes(1);
        });
    });

    describe('Step 2: Module Details', () => {
        it('renders module details fields', () => {
            render(<ListingForm {...defaultProps} step={2} />);
            expect(screen.getByText('Module Details')).toBeInTheDocument();
            expect(screen.getByLabelText('Module Code *')).toBeInTheDocument();
            expect(screen.getByLabelText('Module Name *')).toBeInTheDocument();
            expect(screen.getByLabelText('Faculty *')).toBeInTheDocument();
        });

        it('renders faculty options', () => {
            render(<ListingForm {...defaultProps} step={2} />);
            const select = screen.getByLabelText('Faculty *');
            expect(select).toContainHTML('<option value="EBIT">EBIT</option>');
            expect(select).toContainHTML('<option value="LAW">Law</option>');
        });
    });

    describe('Step 3: Listing Details', () => {
        it('renders listing details fields', () => {
            render(<ListingForm {...defaultProps} step={3} />);
            expect(screen.getByText('Listing Details')).toBeInTheDocument();
            expect(screen.getByLabelText('Condition *')).toBeInTheDocument();
            expect(screen.getByLabelText('Annotation Level *')).toBeInTheDocument();
            expect(screen.getByLabelText('Price (R) *')).toBeInTheDocument();
            expect(screen.getByLabelText('Description *')).toBeInTheDocument();
        });
    });

    
})