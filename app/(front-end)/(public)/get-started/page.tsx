import { Suspense } from "react";
import GetStartedClient from "./GetStartedClient";

export default function Page() {
	return (
		<Suspense fallback={<div className="min-h-screen" />}>
			<GetStartedClient />
		</Suspense>
	);
}