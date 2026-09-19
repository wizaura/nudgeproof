import Widgets from "@/components/dashboard/widgets/Main";

type Props = {
    searchParams: Promise<{
        page?: string;
        search?: string;
        website?: string;
        type?: string;
        status?: string;
    }>;
};

export default async function DashboardWidgetsPage({
    searchParams,
}: Props) {
    return (
        <div>
            <Widgets searchParams={searchParams} />
        </div>
    );
}