terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.75"
    }
  }
}

provider "azurerm" {
  features {}
  skip_provider_registration = "true"
}
