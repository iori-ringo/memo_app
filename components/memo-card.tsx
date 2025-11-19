import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Memo } from "@/types/memo";

interface MemoCardProps {
    memo: Memo;
}

export function MemoCard({ memo }: MemoCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <CardHeader className="pb-2 bg-muted/30">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {format(memo.createdAt, "yyyy年MM月dd日 HH:mm", { locale: ja })}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
                    {/* Fact */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider">Fact</div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{memo.fact}</p>
                    </div>

                    {/* Arrow 1 */}
                    <div className="flex items-center justify-center py-2 md:py-0 md:h-full text-muted-foreground/30">
                        <ArrowRight className="hidden md:block h-5 w-5" />
                        <ArrowDown className="block md:hidden h-5 w-5" />
                    </div>

                    {/* Abstraction */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider">Abstraction</div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{memo.abstraction}</p>
                    </div>

                    {/* Arrow 2 */}
                    <div className="flex items-center justify-center py-2 md:py-0 md:h-full text-muted-foreground/30">
                        <ArrowRight className="hidden md:block h-5 w-5" />
                        <ArrowDown className="block md:hidden h-5 w-5" />
                    </div>

                    {/* Diversion */}
                    <div className="space-y-2">
                        <div className="text-xs font-bold text-primary uppercase tracking-wider">Diversion</div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-foreground/90">{memo.diversion}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
