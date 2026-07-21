import { render, screen } from '@/test-utils';
import Stepper from '../Stepper';

describe('Stepper', () => {
    it('renders all 4 steps', () => {

        render(<Stepper current={1} />);
        expect(screen.getByText(/Personal Details/i)).toBeInTheDocument();

        expect(screen.getByText(/University Email/i)).toBeInTheDocument();
        
        expect(screen.getByText(/Verification/i)).toBeInTheDocument();


        expect(screen.getByText(/Password/i)).toBeInTheDocument();
    });

    it('marks step 1 as active when current is 1', () => {

        render(<Stepper current={1} />);
        const stepCircle = screen.getByText('1');


        expect(stepCircle).toHaveClass('border-[#00B4D8]');
        expect(stepCircle).toHaveClass('text-[#00B4D8]');
    });

    it('marks step as done and step 2 as active when current is 2', () => {

        render(<Stepper current={2} />);
        const checkIcon = screen.getByTestId('check-icon');

        expect(checkIcon).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('marks all  steps as done when current is 5', () => {

        render(<Stepper current={5} />);
        const checkIcons = screen.getAllByTestId('check-icon');

        expect(checkIcons).toHaveLength(4);
    });
});