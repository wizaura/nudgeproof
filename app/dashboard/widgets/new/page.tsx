import { Suspense } from "react";
import NewWidget from "@/components/dashboard/widgets/new/Main";

export default function DashboardWidgetsAddPage() {
    return (
        <Suspense fallback={null}>
            <NewWidget />
        </Suspense>
    );
}