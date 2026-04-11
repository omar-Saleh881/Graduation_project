import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-4 text-xl text-foreground">الصفحة غير موجودة</p>
        <p className="mb-6 text-muted-foreground">عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها</p>
        <Link to="/" className="text-primary underline hover:text-primary/90 text-lg">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
