import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApi } from "../hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  AlertTriangle, 
  Phone, 
  Shield,
  Car,
  Home,
  Users,
  Download,
  ExternalLink,
  CheckCircle
} from "lucide-react";

const emergencyContacts = [
  { name: "Pompiers", number: "18", type: "Urgence", available: "24h/24" },
  { name: "Police", number: "17", type: "Sécurité", available: "24h/24" },
  { name: "SAMU", number: "15", type: "Médical", available: "24h/24" },
  { name: "Protection Civile", number: "33 823 03 50", type: "Évacuation", available: "24h/24" },
  { name: "Mairie de Dakar", number: "33 849 05 00", type: "Information", available: "8h-18h" },
  { name: "ANACIM (Météo)", number: "33 827 13 63", type: "Prévisions", available: "24h/24" }
];

const preparationSteps = [
  {
    title: "Kit d'urgence",
    items: [
      "Eau potable (4L par personne pour 3 jours)",
      "Nourriture non périssable pour 3 jours", 
      "Médicaments personnels",
      "Lampe de poche et piles",
      "Radio portable",
      "Trousse de premiers secours",
      "Copies des documents importants dans un sac étanche"
    ]
  },
  {
    title: "Plan familial",
    items: [
      "Identifier les points de rendez-vous",
      "Mémoriser les numéros d'urgence",
      "Prévoir un contact hors région",
      "Localiser les abris d'évacuation",
      "Planifier les itinéraires d'évacuation",
      "Désigner un responsable pour les animaux domestiques"
    ]
  }
];

const duringFloodActions = [
  "Restez calme et écoutez les autorités",
  "Évitez de marcher ou conduire dans l'eau",
  "Montez aux étages supérieurs si nécessaire",
  "Coupez l'électricité et le gaz",
  "Ne buvez pas l'eau du robinet",
  "Signez votre position aux secours",
  "Restez informé via radio/téléphone"
];

const afterFloodActions = [
  "Attendez l'autorisation avant de rentrer",
  "Vérifiez la structure du bâtiment",
  "Documentez les dégâts avec photos",
  "Nettoyez et désinfectez tout",
  "Jetez les aliments contaminés",
  "Contactez votre assurance",
  "Surveillez votre santé"
];

const Guide = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
              Guide d'Urgence Inondations
            </h1>
            <p className="text-muted-foreground mt-1">
              Préparez-vous et réagissez efficacement face aux risques d'inondation
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>

        {/* Quick Emergency Alert */}
        <Card className="gradient-alert text-danger-foreground">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">En cas d'urgence immédiate</h3>
                <p className="text-sm opacity-90">
                  Composez le 18 (Pompiers) ou le 17 (Police) - Service gratuit 24h/24
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="preparation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preparation">Préparation</TabsTrigger>
            <TabsTrigger value="during">Pendant</TabsTrigger>
            <TabsTrigger value="after">Après</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>

          {/* Préparation */}
          <TabsContent value="preparation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {preparationSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Zones d'évacuation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  Points d'Évacuation à Dakar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Dakar Centre</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Stade Léopold Sédar Senghor</li>
                      <li>• Place de l'Indépendance</li>
                      <li>• Université Cheikh Anta Diop</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Banlieue</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Stade Caroline Faye (Guédiawaye)</li>
                      <li>• Complexe sportif de Pikine</li>
                      <li>• Centre culturel de Rufisque</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pendant l'inondation */}
          <TabsContent value="during" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-danger" />
                  Actions Prioritaires Pendant l'Inondation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {duringFloodActions.slice(0, Math.ceil(duringFloodActions.length/2)).map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
                        <span className="bg-danger text-danger-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {duringFloodActions.slice(Math.ceil(duringFloodActions.length/2)).map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
                        <span className="bg-danger text-danger-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + Math.ceil(duringFloodActions.length/2) + 1}
                        </span>
                        <span className="text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-warning" />
                  Sécurité Routière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm"><strong>Règle des 15 cm :</strong> Ne traversez jamais une route inondée avec plus de 15 cm d'eau</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm"><strong>Courant invisible :</strong> 60 cm d'eau en mouvement peuvent emporter un véhicule</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm"><strong>Alternative :</strong> Faites demi-tour et trouvez un itinéraire alternatif</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Après l'inondation */}
          <TabsContent value="after" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-success" />
                  Retour en Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {afterFloodActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risques Sanitaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p><strong>Eau contaminée :</strong> Évitez tout contact avec l'eau stagnante</p>
                  <p><strong>Électricité :</strong> Faites vérifier votre installation avant de rebrancher</p>
                  <p><strong>Moisissures :</strong> Aérez et déshumidifiez rapidement</p>
                  <p><strong>Vaccination :</strong> Consultez un médecin pour les rappels nécessaires</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts d'urgence */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{contact.name}</h3>
                      <Badge variant="outline">{contact.type}</Badge>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold text-primary">{contact.number}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.available}</p>
                    <Button size="sm" className="w-full mt-3">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Centres d'Hébergement d'Urgence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Centre Principal</h4>
                    <p className="text-sm text-muted-foreground">Palais des Sports - Avenue Léopold Sédar Senghor</p>
                    <p className="text-sm text-primary">Capacité: 500 personnes</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Centre Secondaire</h4>
                    <p className="text-sm text-muted-foreground">Gymnase Municipal - Rue de Thiong</p>
                    <p className="text-sm text-primary">Capacité: 200 personnes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Guide;