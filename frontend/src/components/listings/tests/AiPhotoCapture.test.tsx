import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AiPhotoCapture from '../AiPhotoCapture'

jest.mock('@/lib/listings.api', () => ({ uploadImages: jest.fn() }))
jest.mock('@/lib/vision.api', () => ({ extractText: jest.fn() }))
jest.mock('@/utils/dataUrlToFile', () => ({
  dataUrlToFile: jest.fn(async () => new File(['x'], 'scan.jpg', { type: 'image/jpeg' })),
}))
jest.mock('@/components/listings/CornerCropEditor', () => ({
  __esModule: true,
  default: ({ onConfirm }: { onConfirm: (d: string) => void }) => (
    <button onClick={() => onConfirm('data:image/jpeg;base64,AAA')}>crop-confirm</button>
  ),
}))

import { uploadImages } from '@/lib/listings.api'
import { extractText } from '@/lib/vision.api'

const mockUpload = uploadImages as jest.Mock
const mockExtract = extractText as jest.Mock

const pickPhotoAndCrop = async () => {
  const user = userEvent.setup()
  await user.upload(screen.getByLabelText(/take a photo/i), new File(['x'], 'a.jpg', { type: 'image/jpeg' }))
  await user.click(await screen.findByText('crop-confirm'))
}

beforeEach(() => {
  jest.clearAllMocks()
  global.URL.createObjectURL = jest.fn(() => 'blob:mock')
  global.URL.revokeObjectURL = jest.fn()
})

describe('AiPhotoCapture', () => {


  it('renders both entry buttons', () => {
    render(<AiPhotoCapture onResult={jest.fn()} />)


    expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument()


    expect(screen.getByRole('button', { name: /choose from gallery/i })).toBeInTheDocument()
  })

  it('disables buttons when disabled', () => {
    render(<AiPhotoCapture onResult={jest.fn()} disabled />)
    expect(screen.getByRole('button', { name: /take photo/i })).toBeDisabled()


  })

  it('shows matched-book message on successful match', async () => {


    mockUpload.mockResolvedValue({ urls: ['https://blob/x.jpg'] })


    mockExtract.mockResolvedValue({


      rawText: 'Clean Code',
      matchedBook: { id: 'b1', title: 'Clean Code', confidence: 0.9 },
      extracted: null,
    })
    render(<AiPhotoCapture onResult={jest.fn()} />)
    await pickPhotoAndCrop()


    expect(await screen.findByText(/we found your book/i)).toBeInTheDocument()
  })

  it('shows extracted message when only details were read', async () => {


    mockUpload.mockResolvedValue({ urls: ['https://blob/x.jpg'] })


    mockExtract.mockResolvedValue({
      rawText: '',
      matchedBook: null,
      extracted: { title: 'Clean Code', author: null, edition: null, isbn: null, publisher: null },
    })
    render(<AiPhotoCapture onResult={jest.fn()} />)


    await pickPhotoAndCrop()


    expect(await screen.findByText(/we read these details/i)).toBeInTheDocument()
  })

  it('shows nothing-read message when both are empty', async () => {


    mockUpload.mockResolvedValue({ urls: ['https://blob/x.jpg'] })


    mockExtract.mockResolvedValue({ rawText: '', matchedBook: null, extracted: null })
    render(<AiPhotoCapture onResult={jest.fn()} />)


    await pickPhotoAndCrop()
    expect(await screen.findByText(/couldn't read any book details/i)).toBeInTheDocument()
  })

  it('falls back gracefully when upload fails', async () => {


    mockUpload.mockRejectedValue(new Error('boom'))
    render(<AiPhotoCapture onResult={jest.fn()} />)


    await pickPhotoAndCrop()
    await waitFor(() =>
      expect(screen.getByText(/auto-fill unavailable/i)).toBeInTheDocument(),
    )
  })

  it('emits result with null uploadedUrl on failure', async () => {

    mockUpload.mockRejectedValue(new Error('boom'))
    const onResult = jest.fn()


    render(<AiPhotoCapture onResult={onResult} />)
    await pickPhotoAndCrop()

    
    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith(
        expect.objectContaining({ uploadedUrl: null, matchedBook: null, extracted: null }),
      ),
    )
  })

})