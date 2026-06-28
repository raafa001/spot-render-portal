import { useEffect, useState } from "react";
import axios from "axios";

interface Job {
  key: string;
  project: string;
  variation: string;
  artist: string;
  status: string;
}

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/jobs");
      setJobs(res.data);
    }
    fetchJobs();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Projeto</th>
          <th>Variação</th>
          <th>Artista</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.key}>
            <td>{job.project}</td>
            <td>{job.variation}</td>
            <td>{job.artist}</td>
            <td>{job.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
