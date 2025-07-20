import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, DollarSign, Send } from 'lucide-react';
import apiService from '../services/api';

function ClientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  // Dropzone pour upload de fichiers
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        toast.success('Fichier sélectionné avec succès !');
      }
    },
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles[0]?.errors[0]?.code === 'file-too-large') {
        toast.error('Le fichier est trop volumineux (max 10MB)');
      } else {
        toast.error('Type de fichier non supporté');
      }
    }
  });

  // Surveiller les changements de prix pour validation en temps réel
  const proposedPrice = watch('client_proposed_price');

  // Soumission du formulaire
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Préparer les données avec le fichier
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      if (uploadedFile) {
        formData.append('attached_file', uploadedFile);
      }

      // Envoyer la demande
      const response = await apiService.createRequest(formData);

      if (response.success) {
        setRequestId(response.data.request_id);
        setSubmitSuccess(true);
        toast.success('Demande soumise avec succès ! 🎉');
        reset();
        setUploadedFile(null);
      }

    } catch (error) {
      console.error('Erreur soumission:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage de succès
  if (submitSuccess) {
    return (
      <Card className="shadow-lg border-0">
        <Card.Body className="text-center py-5">
          <div className="mb-4">
            <div 
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '100px', height: '100px', backgroundColor: '#28a745' }}
            >
              <Send size={50} color="white" />
            </div>
          </div>
          
          <h2 className="text-success mb-4">Demande envoyée avec succès ! ✅</h2>
          
          <Alert variant="success" className="mb-4">
            <strong>Numéro de demande :</strong> {requestId}
          </Alert>
          
          <div className="mb-4">
            <h5>📋 Prochaines étapes :</h5>
            <ul className="list-unstyled">
              <li>✅ Votre demande est en cours d'analyse</li>
              <li>🤖 Notre IA traite votre projet</li>
              <li>📧 Vous recevrez une réponse sous 24-48h</li>
              <li>💳 Paiement sécurisé pour finaliser</li>
            </ul>
          </div>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="primary" 
              href={`/status/${requestId}`}
            >
              Suivre ma demande
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setSubmitSuccess(false);
                setRequestId(null);
              }}
            >
              Nouvelle demande
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <Card.Header className="bg-gradient-primary text-white py-4">
        <h3 className="mb-0 text-center">
          <FileText className="me-2" />
          Soumettez votre projet
        </h3>
        <p className="mb-0 text-center mt-2">
          Décrivez votre idée et recevez une solution personnalisée
        </p>
      </Card.Header>

      <Card.Body className="p-4">
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Idée de projet */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              💡 Quelle est votre idée de projet ? *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ex: Je veux créer une application mobile pour la livraison de nourriture..."
              {...register('project_idea', {
                required: 'L\'idée de projet est obligatoire',
                minLength: { value: 10, message: 'Minimum 10 caractères' },
                maxLength: { value: 1000, message: 'Maximum 1000 caractères' }
              })}
              isInvalid={!!errors.project_idea}
            />
            <Form.Control.Feedback type="invalid">
              {errors.project_idea?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Décrivez brièvement votre idée principale (10-1000 caractères)
            </Form.Text>
          </Form.Group>

          {/* Description détaillée */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              📝 Description détaillée du projet *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Décrivez en détail ce que vous voulez accomplir, vos objectifs, les fonctionnalités souhaitées, votre public cible..."
              {...register('project_description', {
                required: 'La description est obligatoire',
                minLength: { value: 20, message: 'Minimum 20 caractères' },
                maxLength: { value: 2000, message: 'Maximum 2000 caractères' }
              })}
              isInvalid={!!errors.project_description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.project_description?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Plus vous êtes précis, meilleure sera notre solution (20-2000 caractères)
            </Form.Text>
          </Form.Group>

          {/* Upload de fichier */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              📎 Fichier de support (optionnel)
            </Form.Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${
                isDragActive ? 'border-primary bg-light' : 'border-secondary'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2" size={40} color="#6c757d" />
              {uploadedFile ? (
                <div>
                  <p className="mb-1 text-success">
                    <strong>Fichier sélectionné :</strong>
                  </p>
                  <p className="mb-0">{uploadedFile.name}</p>
                  <small className="text-muted">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                </div>
              ) : (
                <div>
                  <p className="mb-1">
                    {isDragActive ? 'Déposez le fichier ici...' : 'Cliquez ou déposez un fichier'}
                  </p>
                  <small className="text-muted">
                    Images, PDF, DOC, TXT (max 10MB)
                  </small>
                </div>
              )}
            </div>
          </Form.Group>

          {/* Prix et informations de contact */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <DollarSign className="me-1" size={18} />
                  Votre proposition de prix (€) *
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 150"
                  {...register('client_proposed_price', {
                    required: 'Le prix est obligatoire',
                    min: { value: 0, message: 'Le prix doit être positif' }
                  })}
                  isInvalid={!!errors.client_proposed_price}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.client_proposed_price?.message}
                </Form.Control.Feedback>
                {proposedPrice && proposedPrice > 0 && (
                  <Form.Text className="text-success">
                    💡 Prix proposé : {proposedPrice}€
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  📧 Adresse email *
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="votre@email.com"
                  {...register('email', {
                    required: 'L\'email est obligatoire',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Format d\'email invalide'
                    }
                  })}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  📱 Numéro WhatsApp *
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+225 XX XX XX XX"
                  {...register('whatsapp', {
                    required: 'Le numéro WhatsApp est obligatoire',
                    pattern: {
                      value: /^[\+]?[\d\s\-\(\)]{8,20}$/,
                      message: 'Format de numéro invalide'
                    }
                  })}
                  isInvalid={!!errors.whatsapp}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.whatsapp?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Pour recevoir des notifications rapides
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  ℹ️ Informations supplémentaires
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Secteur d'activité, urgence, contraintes particulières..."
                  {...register('additional_info', {
                    maxLength: { value: 500, message: 'Maximum 500 caractères' }
                  })}
                  isInvalid={!!errors.additional_info}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.additional_info?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Informations importantes */}
          <Alert variant="info" className="mb-4">
            <h6 className="alert-heading">🔍 Comment ça marche ?</h6>
            <ul className="mb-0">
              <li>Notre IA analyse votre projet en détail</li>
              <li>Vous recevez une solution personnalisée sous 24-48h</li>
              <li>Paiement sécurisé uniquement après validation</li>
              <li>Support inclus pour tous nos clients</li>
            </ul>
          </Alert>

          {/* Bouton de soumission */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="px-5 py-3"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '50px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="me-2" size={20} />
                  Envoyer ma demande
                </>
              )}
            </Button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              🔒 Vos données sont sécurisées et ne seront jamais partagées
            </small>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ClientForm;