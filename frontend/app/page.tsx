"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ShadCNTest() {
  

  return (
    <ScrollArea className="h-screen p-10">
      <div className="space-y-14 max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-center">ShadCN UI Playground</h1>

        {/* Accordion */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Accordion</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Open me</AccordionTrigger>
              <AccordionContent>Accordion content here.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Alert */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Alert</h2>
          <Alert>
            <AlertTitle>Alert Title</AlertTitle>
            <AlertDescription>This is an alert message.</AlertDescription>
          </Alert>
        </section>

        {/* Alert Dialog */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Alert Dialog</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Open Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        {/* Avatar */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Avatar</h2>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </section>

        {/* Badge */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Badge</h2>
          <Badge>New</Badge>
        </section>

        {/* Button */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Button</h2>
          <Button>Click Me</Button>
        </section>

        {/* Calendar */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Calendar</h2>
          <Calendar />
        </section>

        {/* Card */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Card</h2>
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
            </CardHeader>
            <CardContent>This is a ShadCN card.</CardContent>
          </Card>
        </section>

        {/* Checkbox */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Checkbox</h2>
          <div className="flex items-center gap-2">
            <Checkbox id="check1" />
            <Label htmlFor="check1">Check me</Label>
          </div>
        </section>

        {/* Collapsible */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Collapsible</h2>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button>Toggle</Button>
            </CollapsibleTrigger>
            <CollapsibleContent>Hidden content revealed!</CollapsibleContent>
          </Collapsible>
        </section>

        {/* Command */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Command</h2>
          <Command className="border rounded-md">
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Item 1</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </section>

        {/* Dialog */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Dialog</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hello</DialogTitle>
              </DialogHeader>
              This is a dialog.
            </DialogContent>
          </Dialog>
        </section>

        {/* Dropdown Menu */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Dropdown Menu</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        {/* Form (basic input test) */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Input / Form</h2>
          <Input placeholder="Enter something..." />
        </section>

        {/* Hover Card */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Hover Card</h2>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button>Hover me</Button>
            </HoverCardTrigger>
            <HoverCardContent>More info on hover…</HoverCardContent>
          </HoverCard>
        </section>

        {/* Navigation Menu */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Navigation Menu</h2>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink>Item 1</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        {/* Popover */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Popover</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button>Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>Popover content here.</PopoverContent>
          </Popover>
        </section>

        {/* Progress */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <Progress value={70} />
        </section>

        {/* Radio Group */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Radio Group</h2>
          <RadioGroup defaultValue="1">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="1" id="r1" />
              <Label htmlFor="r1">Option 1</Label>
            </div>
          </RadioGroup>
        </section>

        {/* Scroll Area */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Scroll Area</h2>
          <ScrollArea className="border h-24 w-48">
            <p>Scrollable content…</p>
          </ScrollArea>
        </section>

        {/* Select */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Select</h2>
          <Select>
            <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One</SelectItem>
              <SelectItem value="2">Two</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Separator */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Separator</h2>
          <Separator />
        </section>

        {/* Sheet */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Sheet</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>Sheet content</SheetContent>
          </Sheet>
        </section>

        {/* Skeleton */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Skeleton</h2>
          <Skeleton className="h-8 w-40" />
        </section>

        {/* Slider */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Slider</h2>
          <Slider defaultValue={[50]} />
        </section>

        {/* Switch */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Switch</h2>
          <div className="flex items-center gap-2">
            <Switch id="switch1" />
            <Label htmlFor="switch1">Enable</Label>
          </div>
        </section>

        {/* Table */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Table</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column 1</TableHead>
                <TableHead>Column 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Value 1</TableCell>
                <TableCell>Value 2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Tabs */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Tabs</h2>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Tab 1 content</TabsContent>
            <TabsContent value="tab2">Tab 2 content</TabsContent>
          </Tabs>
        </section>

        {/* Textarea */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Textarea</h2>
          <Textarea placeholder="Write something…" />
        </section>

        {/* Toast */}
<section>
  <h2 className="text-xl font-semibold mb-2">Toast</h2>

  <Button
    onClick={() =>
      toast("Hello! This is a toast.", {
        description: "Toast description here.",
      })
    }
  >
    Show Toast
  </Button>
</section>


        {/* Toggle */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Toggle</h2>
          <Toggle>Toggle</Toggle>
        </section>

        {/* Tooltip */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Tooltip</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button>Hover Me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip info</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>

      </div>
    </ScrollArea>
  );
}
