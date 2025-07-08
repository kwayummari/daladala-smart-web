// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
// import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import HeroSection from "../components/home/HeroSection";
import QuickSearch from "../components/home/QuickSearch";
import PopularRoutes from "../components/home/PopularRoutes";
import HowItWorks from "../components/home/HowItWorks";
import AppPromotion from "../components/home/AppPromotion";
import Testimonials from "../components/home/Testimonials";
import { getPopularRoutes } from "../services/routeService";
import { checkApiHealth } from "../services/api";

const HomePage = () => {
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check API health first
        const healthCheck = await checkApiHealth();

        if (healthCheck.status === "healthy") {
          setApiStatus("healthy");
          console.log("✅ API is healthy");

          // Load popular routes
          await loadPopularRoutes();
        } else {
          setApiStatus("unhealthy");
          setError(
            "Service temporarily unavailable. Some features may not work properly."
          );
        }
      } catch (err) {
        console.error("❌ HomePage initialization error:", err);
        setApiStatus("unhealthy");
        setError(
          "Unable to connect to our services. Please check your internet connection."
        );
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  const loadPopularRoutes = async () => {
    try {
      console.log("📊 Loading popular routes...");
      const routes = await getPopularRoutes(6); // Get top 6 popular routes
      setPopularRoutes(routes);
      console.log("✅ Popular routes loaded:", routes.length);
    } catch (err) {
      console.error("❌ Failed to load popular routes:", err);
      // Don't show error for popular routes as it's not critical
      setPopularRoutes([]);
    }
  };

  const handleSearchRoutes = async (searchParams) => {
    try {
      console.log("🔍 Searching routes from HomePage:", searchParams);
      // This will be handled by the QuickSearch component
      // but we can add analytics tracking here

      // Track search event for analytics
      if (window.gtag) {
        window.gtag("event", "search", {
          event_category: "Route Search",
          event_label: `${searchParams.startPoint} to ${searchParams.endPoint}`,
        });
      }
    } catch (err) {
      console.error("❌ Search tracking error:", err);
    }
  };

  const handleRetryConnection = async () => {
    setLoading(true);
    setError(null);

    // Wait a bit before retrying
    setTimeout(async () => {
      try {
        const healthCheck = await checkApiHealth();
        if (healthCheck.status === "healthy") {
          setApiStatus("healthy");
          await loadPopularRoutes();
          setError(null);
        } else {
          setApiStatus("unhealthy");
          setError("Service is still unavailable. Please try again later.");
        }
      } catch (err) {
        setApiStatus("unhealthy");
        setError("Connection failed. Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  if (loading && apiStatus === "checking") {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading Daladala Smart...</p>
        </div>
      </Container>
    );
  }

  return (
    <>

      {/* API Status Alert */}
      {error && (
        <Alert variant="warning" className="mb-0 text-center">
          <Container>
            <Row>
              <Col>
                <strong>Connection Issue:</strong> {error}
                {apiStatus === "unhealthy" && (
                  <button
                    className="btn btn-link p-0 ms-2"
                    onClick={handleRetryConnection}
                    disabled={loading}
                  >
                    {loading ? "Retrying..." : "Try Again"}
                  </button>
                )}
              </Col>
            </Row>
          </Container>
        </Alert>
      )}

      {/* Hero Section with Search */}
      <HeroSection onSearch={handleSearchRoutes} />

      {/* Quick Search Component */}
      <QuickSearch onSearch={handleSearchRoutes} apiStatus={apiStatus} />

      {/* Popular Routes Section */}
      <PopularRoutes
        routes={popularRoutes}
        loading={loading && apiStatus === "healthy"}
        error={apiStatus === "unhealthy" ? "Unable to load routes" : null}
        onRetry={loadPopularRoutes}
      />

      {/* How It Works Section */}
      <HowItWorks />

      {/* App Promotion Section */}
      <AppPromotion />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Performance monitoring */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 9999,
          }}
        >
          API: {apiStatus} | Routes: {popularRoutes.length}
        </div>
      )}
    </>
  );
};

export default HomePage;
