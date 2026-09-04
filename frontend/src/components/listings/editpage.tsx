import ListingFormEdit from "./listingFormEdit"
import { Button } from "../ui"

type EditPageProps = {
    onClick: () => void;
    PanelStatus: boolean;
    listingId: string;
}

export default function EditPage({ onClick, PanelStatus = false, listingId }: EditPageProps) {

    return (
        <div className={`fixed top-0 right-0 z-50 h-full w-3/4 bg-background text-foreground shadow-2xl transform transition-transform duration-300 ease-in-out
        overflow-y-auto ${PanelStatus ? 'translate-x-0' : 'translate-x-full'}`}>

            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h1 className="text-xl font-semibold mx-4">Editing listing</h1>
                <Button onClick={onClick} variant="primary" type="button">
                    X
                </Button>
            </div>

            <div className="py-4">
                <ListingFormEdit listingId={listingId} />
            </div>

        </div>
    )
}