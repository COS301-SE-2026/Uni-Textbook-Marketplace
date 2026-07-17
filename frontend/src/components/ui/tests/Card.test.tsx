import { render, screen } from '@/test-utils';
import Card from '../Card';

describe('Card', () => {

    it('renders children', () => {
        const { getByText } = render(<Card>Card content</Card>);


        expect(getByText('Card content')).toBeInTheDocument();
    });

    it('applies default variant class', () => {


        const { container } = render(<Card>Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('card');
    });

    it('applies glass variant class', () => {

        const { container } =  render(<Card variant="glass">Content</Card>);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('bg-white/10');
        expect(card).toHaveClass('backdrop-blur-md');


    })

    it('merges custom className', () => {
        const { container } = render(<Card className="custom-class">Content</Card>);

        
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('custom-class');
    });
});