// src/pages/RoutesPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Pagination,
  Badge,
  InputGroup,
  Dropdown,
} from "react-bootstrap";
import {
  Search,
  FilterList,
  LocationOn,
  Schedule,
  DirectionsBus,
  Star,
  Refresh,
} from "@mui/icons-material";
import { getAllRoutes, searchRoutes } from "../services/routeService";
import { formatCurrency, formatTime } from "../utils/formatters";

const RoutesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [routesPerPage] = useState(12);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [startPoint, setStartPoint] = useState(
    searchParams.get("startPoint") || ""
  );
  const [endPoint, setEndPoint] = useState(searchParams.get("endPoint") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "route_name"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "asc"
  );
  const [activeOnly, setActiveOnly] = useState(
    searchParams.get("activeOnly") !== "false"
  );

  // Load routes on component mount and when search params change
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
    loadRoutes(page);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (startPoint) params.set("startPoint", startPoint);
    if (endPoint) params.set("endPoint", endPoint);
    if (sortBy !== "route_name") params.set("sortBy", sortBy);
    if (sortOrder !== "asc") params.set("sortOrder", sortOrder);
    if (!activeOnly) params.set("activeOnly", "false");
    if (currentPage > 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [
    searchTerm,
    startPoint,
    endPoint,
    sortBy,
    sortOrder,
    activeOnly,
    currentPage,
    setSearchParams,
  ]);

  const loadRoutes = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        console.log("📋 Loading routes page:", page);

        let result;

        // Use search if we have start/end points
        if (startPoint && endPoint) {
          setSearchLoading(true);
          result = await searchRoutes({
            startPoint,
            endPoint,
          });
          setSearchLoading(false);
        } else {
          // Use regular route listing with filters
          result = await getAllRoutes({
            search: searchTerm,
            page,
            limit: routesPerPage,
            sortBy,
            sortOrder,
            active: activeOnly,
          });
        }

        setRoutes(result.routes || []);
        setTotalRoutes(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / routesPerPage));

        console.log("✅ Routes loaded:", {
          count: result.routes?.length || 0,
          total: result.total || 0,
          page,
        });
      } catch (err) {
        console.error("❌ Load routes error:", err);
        setError(err.message || "Failed to load routes");
        setRoutes([]);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [
      searchTerm,
      startPoint,
      endPoint,
      sortBy,
      sortOrder,
      activeOnly,
      routesPerPage,
    ]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await loadRoutes(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setStartPoint("");
    setEndPoint("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRouteClick = (routeId) => {
    navigate(`/routes/${routeId}`);
  };

  const handleRefresh = () => {
    loadRoutes(currentPage);
  };

  const renderRouteCard = (route) => (
    <Col key={route.route_id} lg={4} md={6} className="mb-4">
      <Card
        className="h-100 hover-lift cursor-pointer"
        onClick={() => handleRouteClick(route.route_id)}
        style={{ cursor: "pointer" }}
      >
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <Card.Title className="h5 mb-1">{route.route_name}</Card.Title>
              <Badge
                variant={route.status === "active" ? "success" : "secondary"}
                className="mb-2"
              >
                {route.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            {route.rating && (
              <div className="d-flex align-items-center">
                <Star className="text-warning me-1" fontSize="small" />
                <span className="fw-bold">{route.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <LocationOn className="text-primary me-2" fontSize="small" />
              <div>
                <div className="fw-semibold">{route.start_point}</div>
                <div className="text-muted small">to {route.end_point}</div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <DirectionsBus
                  className="text-secondary me-1"
                  fontSize="small"
                />
                <span className="small text-muted">
                  {route.vehicle_count || 0} vehicles
                </span>
              </div>
              {route.estimated_duration && (
                <div className="d-flex align-items-center">
                  <Schedule className="text-secondary me-1" fontSize="small" />
                  <span className="small text-muted">
                    ~{route.estimated_duration} min
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-primary">
                  From {formatCurrency(route.base_fare || 0)}
                </div>
                <div className="small text-muted">
                  {route.stops_count || 0} stops
                </div>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRouteClick(route.route_id);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {startPage > 1 && <Pagination.Ellipsis />}
          {pages}
          {endPage < totalPages && <Pagination.Ellipsis />}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Routes - Daladala Smart | Find Your Route</title>
        <meta
          name="description"
          content="Browse all available daladala routes in Tanzania. Find the best route for your journey with real-time information and fare details."
        />
        <meta
          name="keywords"
          content="daladala routes, public transport routes, Tanzania routes, Dar es Salaam transport"
        />
      </Helmet>

      <Container className="py-4">
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="h2 mb-1">Available Routes</h1>
                <p className="text-muted mb-0">
                  {totalRoutes > 0 && (
                    <>
                      Showing {routes.length} of {totalRoutes} routes
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="outline-secondary"
                onClick={handleRefresh}
                disabled={loading}
              >
                <Refresh className="me-1" />
                Refresh
              </Button>
            </div>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSearch}>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Label>Search Routes</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search by route name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary" type="submit">
                      <Search />
                    </Button>
                  </InputGroup>
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Starting point"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                  />
                </Col>

                <Col md={3} className="mb-3">
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Destination"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                  />
                </Col>

                <Col md={2} className="mb-3">
                  <Form.Label>Sort By</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-secondary"
                      className="w-100"
                    >
                      <FilterList className="me-1" />
                      {sortBy === "route_name"
                        ? "Name"
                        : sortBy === "base_fare"
                          ? "Fare"
                          : sortBy === "rating"
                            ? "Rating"
                            : "Created"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setSortBy("route_name")}>
                        Name
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy("base_fare")}>
                        Fare
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy("rating")}>
                        Rating
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy("created_at")}>
                        Newest
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>

              <Row>
                <Col>
                  <div className="d-flex gap-3 align-items-center">
                    <Form.Check
                      type="checkbox"
                      label="Active routes only"
                      checked={activeOnly}
                      onChange={(e) => setActiveOnly(e.target.checked)}
                    />
                    <Form.Check
                      type="radio"
                      label="Ascending"
                      name="sortOrder"
                      checked={sortOrder === "asc"}
                      onChange={() => setSortOrder("asc")}
                    />
                    <Form.Check
                      type="radio"
                      label="Descending"
                      name="sortOrder"
                      checked={sortOrder === "desc"}
                      onChange={() => setSortOrder("desc")}
                    />
                    {(searchTerm || startPoint || endPoint) && (
                      <Button
                        variant="link"
                        onClick={handleClearSearch}
                        className="p-0"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {(loading || searchLoading) && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">
              {searchLoading ? "Searching routes..." : "Loading routes..."}
            </p>
          </div>
        )}

        {/* Routes Grid */}
        {!loading && !error && (
          <>
            {routes.length > 0 ? (
              <>
                <Row>{routes.map(renderRouteCard)}</Row>
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-5">
                <DirectionsBus
                  className="text-muted mb-3"
                  style={{ fontSize: "4rem" }}
                />
                <h3 className="text-muted">No Routes Found</h3>
                <p className="text-muted mb-3">
                  {searchTerm || startPoint || endPoint
                    ? "Try adjusting your search criteria"
                    : "No routes are available at the moment"}
                </p>
                {(searchTerm || startPoint || endPoint) && (
                  <Button variant="primary" onClick={handleClearSearch}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default RoutesPage;
