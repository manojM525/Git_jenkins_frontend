pipeline {
  agent any

  environment {

    SERVICE_NAME        = 'frontend'                         
    DOCKER_CRED_ID      = 'docker_creds'
    GIT_CRED_ID         = 'git_access_cred'
    DEPLOYMENT_REPO_URL = 'https://github.com/manojM525/DEVOPS_DEPLOYMENT.git'
    DEPLOYMENT_REPO_DIR = 'DEVOPS_DEPLOYMENT'
    DEPLOYMENT_FILE     = 'frontend/deployment.yaml'        
    DOCKER_IMAGE        = 'manojm525/frontend'                  
    ARGOCD_SERVER       = 'argocd.example.com'
    ARGOCD_TOKEN_ID     = 'argocd-token'
    ARGOCD_APP_NAME     = 'myapp'
  }

  stages {
    stage('Checkout Source') {
      steps {
        checkout scm
      }
    }

    stage('Read Version') {
      steps {
        script {
          def pkg = readJSON file: 'package.json'
          env.NEW_VERSION = pkg.version
          echo "Detected version: ${env.NEW_VERSION}"
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
              echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
              docker build -t ${DOCKER_IMAGE}:${NEW_VERSION} --build-arg REACT_APP_API_URL="" .
              docker push ${DOCKER_IMAGE}:${NEW_VERSION}
              docker logout
            '''
          }
        }
      }
    }

    stage('Update Deployment Manifest Repo') {
      steps {
        script {
          // Clone the manifests repo
          sh "rm -rf ${DEPLOYMENT_REPO_DIR}"
          dir("${DEPLOYMENT_REPO_DIR}") {
            checkout([$class: 'GitSCM',
                branches: [[name: '*/main']],
                userRemoteConfigs: [[
                   url: DEPLOYMENT_REPO_URL,
                   credentialsId: GIT_CRED_ID
                ]]
            ])

          
          // Update image tag using yq
          
            sh """
              yq e -i '.spec.template.spec.containers[0].image = "${DOCKER_IMAGE}:${NEW_VERSION}"' ${DEPLOYMENT_FILE}
              echo "🧩 Updating backend image in ${DEPLOYMENT_FILE}..."
              """
             withCredentials([usernamePassword(credentialsId: env.GIT_CRED_ID, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) { 
            
            sh """
              git config user.name "jenkins-ci"
              git config user.email "jenkins@company.com"
              git checkout main || git checkout -b main
              git add ${DEPLOYMENT_FILE}
              git commit -m "chore(${SERVICE_NAME}): bump image to v${NEW_VERSION}" || echo "no changes"
              git push https://${GIT_USER}:${GIT_PASS}@github.com/manojM525/DEVOPS_DEPLOYMENT.git main
            """
             }
          }
        }
      }
    }

    // stage('Trigger ArgoCD Sync') {
    //   steps {
    //     script {
    //       withCredentials([string(credentialsId: env.ARGOCD_TOKEN_ID, variable: 'ARGO_TOKEN')]) {
    //         sh """
    //           argocd login ${ARGOCD_SERVER} --sso --insecure --username admin --password "\${ARGO_TOKEN}" || true
    //           argocd app sync ${ARGOCD_APP_NAME} --server ${ARGOCD_SERVER} || true
    //           argocd app wait ${ARGOCD_APP_NAME} --server ${ARGOCD_SERVER} --health --timeout 300
    //         """
    //       }
    //     }
    //   }
    // }
  }
}
