import  { render, screen, fireEvent } from '@/test-utils';
import Select from '../Select';

describe('Select', () => {

    it('renders with label', () => {

        render(<Select label="Choose option">Select</Select>);


        expect(screen.getByText('Choose option')).toBeInTheDocument();
    });

    it('renders without label', () => {


        render(<Select>Select</Select>);
        expect(screen.queryByText('Choose option')).not.toBeInTheDocument();

    });

    it('renders childern as options', () => {
        render(
            <Select>

                <option value="1">Option 1</option>
                <option value="2">Option 2</option>


            </Select>
        );
        expect(screen.getByText('Option 1')).toBeInTheDocument();


        expect(screen.getByText('Option 1')).toBeInTheDocument();

    });

    it('calls onChange when value changes', () => {


        const handleChange = jest.fn();
        render(


            <Select onChange={handleChange} value="1">

                <option value="1">Option 1</option>
                <option value="2">Option 2</option>


            </Select>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
        
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});