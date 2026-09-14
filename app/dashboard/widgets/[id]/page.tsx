import WidgetDetails from "@/components/dashboard/widgets/details/Main";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DashboardWidgetsDetailsPage({
    params,
}: Props) {
    const { id } = await params;

    return (
        <div>
            <WidgetDetails id={id} />
        </div>
    );
}