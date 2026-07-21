import ListingFormEdit from "./listingFormEdit"

type EditPageProps = {
    onClick: () => void;
    PanelStatus: boolean;
    listingId: string;
}

export default function EditPage({ onClick, PanelStatus = false, listingId }: EditPageProps) {

    return (
        <div className={`fixed top-0 right-0 z-50 h-full w-3/4 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        overflow-y-auto ${PanelStatus ? 'translate-x-0' : 'translate-x-full'}`}>

            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h1 className="text-xl font-semibold mx-4">Editing listing</h1>
                <button onClick={onClick} className="p-2 text-gray-500 rounded-md hover:bg-gray-100">
                    X
                </button>
            </div>

            <div className="py-4">
                <ListingFormEdit listingId={listingId} />
            </div>

        </div>
    )
}