import WebsiteDetails from "@/components/dashboard/websites/details/Main";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DashboardWebsitesDetailsPage({
    params,
}: Props) {

    const { id } = await params;

    return (
        <div>
            <WebsiteDetails id={id} />
        </div>
    )
}