import { useState } from "react";
import AppLayout from "../components/AppLayout.jsx";
import { Icon } from "../dashboard/Icons.jsx";
import api, { errorMessage } from "../api.js";

export default function Reports() {
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const downloadCsv = async (endpoint, filename, key) => {
    setDownloading(key);
    setError("");
    try {
      const res = await api.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setDownloading("");
    }
  };

  return (
    <AppLayout>
      <div className="hello">
        <div>
          <h1 className="gradient-text">Reports & Exports</h1>
          <p className="muted">Download your channel and video performance analytics as CSV files</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="row row-a">
        <article className="report-card">
          <div className="report-icon tone-violet"><Icon name="content" size={24} /></div>
          <div className="report-info">
            <h3>Video Performance Report</h3>
            <p>Full breakdown of all synced YouTube videos including views, likes, comments, shares, engagement rate, and watch time.</p>
            <div className="report-actions">
              <button className="btn btn-sm" disabled={downloading === "videos"}
                onClick={() => downloadCsv("/api/reports/export/videos", "creatoriq_videos.csv", "videos")}>
                <Icon name="download" size={14} /> {downloading === "videos" ? "Exporting..." : "Export Videos CSV"}
              </button>
            </div>
          </div>
        </article>

        <article className="report-card">
          <div className="report-icon tone-gold"><Icon name="youtube" size={24} /></div>
          <div className="report-info">
            <h3>Channel Summary Report</h3>
            <p>High-level channel summary with subscriber count, total views, average engagement rate, and estimated AdSense revenue.</p>
            <div className="report-actions">
              <button className="btn-gold btn-sm" disabled={downloading === "channel"}
                onClick={() => downloadCsv("/api/reports/export/channel", "creatoriq_channel_report.csv", "channel")}>
                <Icon name="download" size={14} /> {downloading === "channel" ? "Exporting..." : "Export Channel CSV"}
              </button>
            </div>
          </div>
        </article>
      </div>
    </AppLayout>
  );
}
