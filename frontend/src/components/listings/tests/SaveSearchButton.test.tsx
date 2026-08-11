import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SaveSearchButton from '../SaveSearchButton'



jest.mock('@/lib/saved-searches.api', () => ({
  createSavedSearch: jest.fn(),
}))


jest.mock('lucide-react', () => ({

  Bookmark: () => <span data-testid="bookmark-icon">Bookmark</span>,


  BookmarkCheck: () => <span data-testid="bookmark-check-icon">BookmarkCheck</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,

}))

describe('SaveSearchButton', () => {

  const mockOnSave = jest.fn()
  const mockFilters = {
    faculty: 'EBIT',
    moduleCode: 'COS301',
    condition: 'good',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders button with "Save this search" text when no filters applied', () => {

    render(<SaveSearchButton filters={{}} onSave={mockOnSave} />)
    expect(screen.getByText('Save this search')).toBeInTheDocument()

    expect(screen.getByTestId('bookmark-icon')).toBeInTheDocument()
  })

  it('renders button with filters applied', () => {

    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    const button = screen.getByRole('button')


    expect(button).toBeEnabled()
    expect(screen.getByText('Save this search')).toBeInTheDocument()

  })

  it('shows helper text when no filters applied', () => {

    render(<SaveSearchButton filters={{}} onSave={mockOnSave} />)
    expect(screen.getByText('Apply filters to save this search')).toBeInTheDocument()
  })

  it('does not show helper text when filters are applied', () => {


    render(<SaveSearchButton filters={mockFilters} onSave={mockOnSave} />)
    expect(screen.queryByText('Apply filters to save this search')).not.toBeInTheDocument()

  })

 
})