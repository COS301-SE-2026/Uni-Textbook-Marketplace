import { render, screen, fireEvent } from '@/test-utils';
import Input from '../Input';

describe('Input', () => {

    it('renders with label', () => {


        render(<Input label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders without label when not provided', () => {

        render(<Input />);

        expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });

    it('renders with placeholder', () => {


        render(<Input placeholder="Enter your email" />);
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();


    });

    it('renders with value', () => {
        render(<Input value="test@university.ac.za" onChange={() => {}} />);


        expect(screen.getByDisplayValue('test@university.ac.za')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        const handleChange = jest.fn();

        render(<Input onChange={handleChange} />);
        const input = screen.getByRole('textbox');


        fireEvent.change(input, { target: { value: 'new value' } });
        expect(handleChange).toHaveBeenCalledTimes(1);

        expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" />);


        expect(screen.getByRole('textbox')).toHaveClass('custom-class');
    });

    it('renders with type="number"', () => {

        
        render(<Input type="number" />);
        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
});