import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
function DashboardCard({ title, value, icon }) {
    return (
      <Card className="bg-white border border-[#17cf42]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#17cf42]">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#17cf42]">{value}</div>
        </CardContent>
      </Card>
    )
  }
export default DashboardCard