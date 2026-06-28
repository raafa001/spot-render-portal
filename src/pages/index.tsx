import Head from "next/head";
import UploadForm from "../components/UploadForm";
import JobsTable from "../components/JobsTable";

export default function Home() {
  return (
    <>
      <Head>
        <title>Spot Render Portal</title>
      </Head>
      <main className="container">
        <h1>Spot Render</h1>
        <UploadForm />
        <JobsTable />
      </main>
    </>
  );
}
