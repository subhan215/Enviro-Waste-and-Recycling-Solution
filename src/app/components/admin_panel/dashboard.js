import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

function DashboardCard({ title, value, icon }) {
  return (
    <Card className="bg-white border border-custom-green">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <div className="flex items-center space-x-2">
      {icon}
      <CardTitle className="text-sm md:text-base font-medium text-custom-black">{title}</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-xl md:text-2xl lg:text-3xl text-custom-black text-center">{value}</div>
  </CardContent>
</Card>

  );
}

export default DashboardCard;
