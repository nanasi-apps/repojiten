import { Link as RouterLink } from 'react-router';

import type { HelloData } from '@repojiten/frontend-domain';
import { useHello } from '@repojiten/frontend-domain';
import {
  Alert,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Spinner,
} from '@repojiten/frontend-ui';

const foundationItems = [
  'TypeSpec source of truth',
  'Generated OpenAPI and SDK',
  'OpenSpec scenario IDs',
  'Cloudflare Workers local runtime',
  'Radix/shadcn UI package',
  'Clean frontend/backend package boundaries',
];

function IntroSection({ onRefresh, isLoading }: { onRefresh: () => void; isLoading: boolean }) {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <Badge variant="outline" className="w-fit">
          v0.1 foundation
        </Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">Repojiten</h1>
        <p className="max-w-3xl text-muted-foreground">
          Repository から Wiki と OpenSpec を扱うための開発基盤です。現在の初期画面は、認証や
          product data に依存せずに frontend と API の起動状態を確認する smoke target です。
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" size="lg" onClick={onRefresh} disabled={isLoading}>
          Refresh Hello API
        </Button>
        <Button asChild variant="ghost" size="lg">
          <RouterLink to="/users">Open sample Users</RouterLink>
        </Button>
      </div>
    </section>
  );
}

function ApiHealthCard({ data }: { data: HelloData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API health</CardTitle>
        <CardDescription>Live response from /api/v1/hello</CardDescription>
      </CardHeader>
      <CardContent>
        {data.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-2/5" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>Fetching latest message...</span>
            </div>
          </div>
        )}

        {data.error != null && (
          <Alert variant="destructive" className="mt-1">
            <AlertTitle>Error loading data</AlertTitle>
            {data.error.message}
          </Alert>
        )}

        {data.timestamp != null && (
          <div className="mt-1 space-y-3">
            <p className="font-semibold">{data.message}</p>
            <p className="text-sm text-muted-foreground">
              Timestamp: {data.timestamp.toLocaleString()}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>200 OK</Badge>
              <Badge variant="outline">Workers</Badge>
              <Badge variant="outline">Hono</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FoundationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Foundation checks</CardTitle>
        <CardDescription>Repojiten v0.1 が前提にする開発基盤</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {foundationItems.map((item) => (
            <div key={item} className="rounded-md border px-3 py-2 text-sm">
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Initial Repojiten page with API status and foundation overview. */
function HomePage() {
  const { data, actions } = useHello();

  return (
    <div className="space-y-8">
      <IntroSection onRefresh={actions.refresh} isLoading={data.isLoading} />

      <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_1.2fr]">
        <ApiHealthCard data={data} />
        <FoundationCard />
      </div>
    </div>
  );
}

export { HomePage };
