import { render, screen, fireEvent } from '@/test-utils';
import TextArea from '../TextArea';

describe('TextArea', () => {

    it('renders with label', () => {
        render(<TextArea label="Description" />);

        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {

        render(<TextArea placeholder="Enter description" />);

        
        expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('renders with value and calls onChange', () => {

        const handleChange = jest.fn();
        render(<TextArea value="Initial" onChange={handleChange} />);


        const textarea = screen.getByDisplayValue('Initial');

        fireEvent.change(textarea, { target: { value: 'Updated '} });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('uses default rows of 4', () => {

        render(<TextArea />);
        const textarea = screen.getByRole('textbox');

        expect(textarea).toHaveAttribute('rows', '4');
    });

    it('respects custom rows', () => {
        render(<TextArea rows={6} />);

        const textarea = screen.getByRole('textbox');

        expect(textarea).toHaveAttribute('rows', '6');
    });
});