import { render, screen } from '@/test-utils';
import Badge from '../Badge';

describe('Badge', () => {


    it('renders children', () => {

        
        render(<Badge>Pending</Badge>);


        expect(screen.getByText('Pending')).toBeInTheDocument();

    });

    it('applies pending variant by default', () => {


        render(<Badge>Pending</Badge>);


        expect(screen.getByText('Pending')).toHaveClass('badge-pending');
    });
;
    it('applies approved variant', () => {


        render(<Badge variant="approved">Approved</Badge>);


        expect(screen.getByText('Approved')).toHaveClass('badge-approved');
    });

    it('applies rejected variant', () => {

        render(<Badge variant="rejected">Rejected</Badge>);


        expect(screen.getByText('Rejected')).toHaveClass('badge-rejected');


    });
});