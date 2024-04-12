terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.99"
    }
  }
}

provider "azurerm" {
  features {}
}
